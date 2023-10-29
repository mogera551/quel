import "../types.js";
import { Symbols } from "../Symbols.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { utils } from "../utils.js";

export class Binding {

  /** @type { import("./nodePoperty/NodeProperty.js").NodeProperty } */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty
  }

  /** @type { import("./ViewModelProperty.js").ViewModelProperty } */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }

  /** @type {Component} */
  #component;
  get component() {
    return this.#component;
  }

  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }

  /** @type {ContextParam} コンテキスト変数情報 */
  #contextParam;
  get contextParam() {
    return this.#contextParam;
  }

  /** @type { ChildBinding[] } */
  children = [];

  /** @type {boolean} */
  get expandable() {
    return this.nodeProperty.expandable;
  }

  /**
   * 
   * @param {Component} component 
   * @param {ContextInfo} context
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodePoperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {ViewModel} viewModel
   * @param {string} viewModelPropertyName
   * @param {typeof import("./ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  constructor(component, context,
    node, nodePropertyName, classOfNodeProperty, 
    viewModel, viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    this.#component = component;
    this.#context = context;
    const propName = PropertyName.create(viewModelPropertyName);
    if (propName.level > 0) {
      this.#contextParam = context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
    }
    this.#nodeProperty = new classOfNodeProperty(this, node, nodePropertyName, filters, component.filters.in);
    this.#viewModelProperty = new classOfViewModelProperty(this, viewModel, viewModelPropertyName, filters, component.filters.out);
  }

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty } = this;
    if (!nodeProperty.applicable) return;
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (nodeProperty.value !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(nodeProperty.node, nodeProperty.name, viewModelProperty.name, filteredViewModelValue, () => {
        nodeProperty.value = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {
    const { nodeProperty, viewModelProperty } = this;
    if (!viewModelProperty.applicable) return;
    const filteredNodelValue = nodeProperty.filteredValue;
    viewModelProperty.value = filteredNodelValue;
  }

  /**
   * 
   * @param {Event} event 
   */
  execEventHandler(event) {
    const {component, viewModelProperty, context} = this;
    event.stopPropagation();
    const process = new ProcessData(
      viewModelProperty.viewModel[Symbols.directlyCall], 
      viewModelProperty.viewModel, 
      [viewModelProperty.name, context, event]
    );
    component.updateSlot.addProcess(process);
  }

  /** @type {(event:Event)=>void} */
  get eventHandler() {
    return (binding => event => binding.execEventHandler(event))(this);
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefaultEventHandler(event) {
    const {component} = this;
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    component.updateSlot.addProcess(process);
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
   * @param {ChildBinding} childBinding
   */
  appendChild(childBinding) {
    if (!this.expandable) utils.raise("not expandable");
    const lastChild = this.children[this.children,length - 1];
    this.children.push(childBinding);
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    beforeNode.parentNode.insertBefore(childBinding.fragment, beforeNode.nextSibling);
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
}

export class ChildBinding {
  /** @type {Binding[]} */
  bindings = [];

  /** @type {Node[]} */
  nodes = [];

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
    const { bindings, content } = ViewTemplate.render(component, template, context);
    this.bindings = bindings;
    this.nodes = Array.from(content.childNodes);
    this.#fragment = content;
    this.#context = context;
    this.#template = template;
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
    this.bindings.forEach(binding => binding.children.forEach(bindings => bindings.removeFromParent()));
  }

  /**
   * expandableバインドをバインドツリーから取得
   * @param {Set<string>} setOfKey 
   * @returns {Binding[]}
   */
  getExpandableBindings(setOfKey) {
    /** @type {Binding[]} */
    const bindings = this.bindings;
    const expandableBindings = [];
    const stack = [ { bindings, children:null, index:-1 } ];
    while(stack.length > 0) {
      const info = stack[stack.length - 1];
      info.index++;
      if (info.bindings) {
        if (info.index < info.bindings.length) {
          const binding = info.bindings[info.index];
          if (binding.expandable) {
            if (setOfKey.has(binding.viewModelProperty.key)) {
              expandableBindings.push(binding);
            } else {
              if (binding.children.length > 0) {
                stack.push({ bindings:null, children:binding.children, index:-1 });
              }
            }
          }
        } else {
          stack.pop();
        }
      } else {
        if (info.index < info.children.length) {
          const bindings = info.children[info.index].bindings;
          if (bindings.length > 0) {
            stack.push({ bindings:bindings, children:null, index:-1 });
          }
        } else {
          stack.pop();
        }
      }
    }
    return expandableBindings;
  }

  /**
   * updateされたviewModelのプロパティにバインドされているnodeについてプロパティを更新する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  updateNode(setOfUpdatedViewModelPropertyKeys) {
    // templateを先に展開する
    /**
     * @type {Set<Binding>}
     */
    const expandableBindings = new Set(this.getExpandableBindings(setOfUpdatedViewModelPropertyKeys));
    for(const binding of expandableBindings) {
      binding.updateNode(setOfUpdatedViewModelPropertyKeys);
    }

    /**
     * 
     * @param {Binding[]} bindings 
     */
    const updateNode_ = (bindings) => {
      for(const binding of bindings) {
        if (expandableBindings.has(binding)) return;
        binding.updateNode(setOfUpdatedViewModelPropertyKeys);
        if (!binding.expandable) return;
        for(const bindings of binding.children) {
          updateNode_(bindings);
        }
      }
    };
    updateNode_(this);
  }
}