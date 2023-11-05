import "../types.js";
import { Symbols } from "../Symbols.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { utils } from "../utils.js";
import { Selector } from "../binder/Selector.js";
import { Binder } from "../binder/Binder.js";

export class Binding {
  /** @type {number} */
  static seq = 0;

  /** @type {number} */
  #id;
  get id() {
    return this.#id;
  }

  /** @type {BindingManager} */
  #bindingManager;
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type { import("./nodeProperty/NodeProperty.js").NodeProperty } */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty
  }

  /** @type { import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty } */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }

  /** @type {Component} */
  get component() {
    return this.bindingManager.component;
  }

  /** @type {ContextInfo} */
  get context() {
    return this.bindingManager.context;
  }

  /** @type {ContextParam | undefined | null} コンテキスト変数情報 */
  #contextParam;
  /** @type {ContextParam | null} コンテキスト変数情報 */
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = PropertyName.create(this.viewModelProperty.name);
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      } else {
        this.#contextParam = null;
      }
    }
    return this.#contextParam;
  }

  /** @type { BindingManager[] } */
  #children = [];
  get children() {
    return this.#children;
  }

  /** @type {boolean} */
  get expandable() {
    return this.nodeProperty.expandable;
  }

  /** @type {boolean} */
  get isSelectValue() {
    return this.nodeProperty.isSelectValue;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {ViewModel} viewModel
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  constructor(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModel, viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    this.#id = ++Binding.seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = new classOfNodeProperty(this, node, nodePropertyName, filters, bindingManager.component.filters.in);
    this.#viewModelProperty = new classOfViewModelProperty(this, viewModel, viewModelPropertyName, filters, bindingManager.component.filters.out);
  }

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty, expandable } = this;
    if (!nodeProperty.applicable) return;
    const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
    if (nodeProperty.isSameValue(filteredViewModelValue)) return;
    /**
     * 展開可能（branchもしくはrepeat）な場合、変更スロットに入れずに展開する
     * 展開可能でない場合、変更スロットに変更処理を入れる
     * ※変更スロットに入れるのは、selectとoptionの値を入れる処理の順序をつけるため
     */
    expandable ? nodeProperty.assignFromViewModelValue() : component.updateSlot.addNodeUpdate(this);
  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {
    const { nodeProperty, viewModelProperty } = this;
    if (!viewModelProperty.applicable) return;
    viewModelProperty.value = nodeProperty.filteredValue;
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefaultEventHandler(event) {
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    this.component.updateSlot.addProcess(process);
  }

  /** @type {(event:Event)=>void} */
  get defaultEventHandler() {
    return (binding => event => binding.execDefaultEventHandler(event))(this);
  }

  /**
   * 初期化
   */
  initialize() {
    this.nodeProperty.initialize();
    this.viewModelProperty.initialize();
    this.applyToNode();
  }

  /**
   * @param {BindingManager} bindingManager
   */
  appendChild(bindingManager) {
    if (!this.expandable) utils.raise("not expandable");
    const lastChild = this.children[this.children.length - 1];
    this.children.push(bindingManager);
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   * updateされたviewModelのプロパティにバインドされているnodeについてプロパティを更新する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  updateNode(setOfUpdatedViewModelPropertyKeys) {
    this.nodeProperty.beforeUpdate(setOfUpdatedViewModelPropertyKeys);
    if (this.viewModelProperty.isUpdate(setOfUpdatedViewModelPropertyKeys)) {
      this.applyToNode();
    }
  }

  /**
   * コンテキスト変更処理
   * #contextParamをクリアする
   */
  changeContext() {
    this.#contextParam = undefined;
  }
}

export class BindingManager {
  /** @type { Component } */
  #component;
  get component() {
    return this.#component;
  }

  /** @type {Binding[]} */
  #bindings = [];
  get bindings() {
    return this.#bindings;
  }

  /** @type {Node[]} */
  #nodes = [];
  get nodes() {
    return this.#nodes;
  }

  get lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  /** @type {DocumentFragment} */
  #fragment;
  get fragment() {
    return this.#fragment;
  }

  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
    this.bindings.forEach(binding => binding.changeContext());
  }

  /** @type {HTMLTemplateElement} */
  #template;
  get template() {
    return this.#template;
  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   */
  constructor(component, template, context) {
    this.#context = context;
    this.#component = component;
    this.#template = template;
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    this.#bindings = Binder.bind(this, nodes);
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * 
   */
  applyToNode() {
    this.bindings.forEach(binding => binding.applyToNode());
  }

  /**
   * 
   */
  applyToViewModel() {
    this.bindings.forEach(binding => binding.applyToViewModel());
  }

  /**
   * 
   */
  removeFromParent() {
    this.nodes.forEach(node => this.fragment.appendChild(node));
    this.bindings.forEach(binding => {
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.removeFromParent());
    });
    const recycleBindingManagers = BindingManager.bindingsByTemplate.get(this.template) ?? 
      BindingManager.bindingsByTemplate.set(this.template, []).get(this.template);
    recycleBindingManagers.push(this);
  }

  /**
   * updateされたviewModelのプロパティにバインドされているnodeについてプロパティを更新する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  updateNode(setOfUpdatedViewModelPropertyKeys) {
    // templateを先に展開する
    /**
     * 
     * @param {Binding[]} bindings 
     */
    const expandableUpdateNode_ = (bindings) => {
      for(const binding of bindings) {
        if (binding.expandable && setOfUpdatedViewModelPropertyKeys.has(binding.viewModelProperty.key)) {
          binding.updateNode(setOfUpdatedViewModelPropertyKeys);
        }
        for(const bindingManager of binding.children) {
          expandableUpdateNode_(bindingManager.bindings);
        }
      }
    };
    expandableUpdateNode_(this.bindings);

    /**
     * 
     * @param {Binding[]} bindings 
     */
    const updateNode_ = (bindings) => {
      for(const binding of bindings) {
        if (!binding.expandable) {
          binding.updateNode(setOfUpdatedViewModelPropertyKeys);
        }
        for(const bindingManager of binding.children) {
          updateNode_(bindingManager.bindings);
        }
      }
    };
    updateNode_(this.bindings);
  }

  /** @type {Map<HTMLTemplateElement,BindingManager[]>} */
  static bindingsByTemplate = new Map;

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   */
  static create(component, template, context) {
    const bindingManagers = this.bindingsByTemplate.get(template) ?? [];
    if (bindingManagers.length > 0) {
      const bindingManager = bindingManagers.pop();
      bindingManager.context = context;
      /**
       * 
       * @param {Binding[]} bindings 
       * @param {ContextInfo} context 
       */
      const setContext = (bindings, context) => {
        for(const binding of bindings) {
          binding.applyToNode();
          for(const bindingManager of binding.children) {
            setContext(bindingManager.bindings, context);
          }
        }
      };
      setContext(bindingManager.bindings, context);
  
      return bindingManager;
    } else {
      return new BindingManager(component, template, context);
    }
  }

}