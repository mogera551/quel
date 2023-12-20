import "../types.js";
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
    return this.#bindingManager.component;
  }

  /** @type {ContextInfo} */
  get context() {
    return this.#bindingManager.context;
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

  /** @type {boolean} */
  #updated;
  get updated() {
    return this.#updated;
  }
  set updated(value) {
    this.#updated = value;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  build(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    this.#id = ++Binding.seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = new classOfNodeProperty(this, node, nodePropertyName, filters, bindingManager.component.filters.in);
    this.#viewModelProperty = new classOfViewModelProperty(this, viewModelPropertyName, filters, bindingManager.component.filters.out);
  }

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty, expandable } = this;
    //console.log(`binding.applyToNode() ${nodeProperty.node?.tagName} ${nodeProperty.name} ${viewModelProperty.name} ${viewModelProperty.indexesString}`);
    if (!nodeProperty.applicable) return;
    const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
    if (nodeProperty.isSameValue(filteredViewModelValue)) return;
    nodeProperty.assignFromViewModelValue();
  }

  /**
   * 
   * @param {Set<number>} setOfIndex 
   */
  applyToChildNodes(setOfIndex) {
    this.nodeProperty.applyToChildNodes(setOfIndex);

  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {
    const { viewModelProperty } = this;
    if (!viewModelProperty.applicable) return;
    viewModelProperty.assignFromNodeValue();
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
//    this.applyToNode();
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
   * 
   * @param {number} index 
   * @param {BindingManager} bindingManager 
   */
  replaceChild(index, bindingManager) {
    if (!this.expandable) utils.raise("not expandable");
    const lastChild = this.children[index - 1];
    this.children[index] = bindingManager;
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   * コンテキスト変更処理
   * #contextParamをクリアする
   */
  changeContext() {
    this.#contextParam = undefined;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  static create(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    const binding = new Binding;
    binding.build(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty,
      filters
    );
    return binding;
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
    return this.#nodes[this.#nodes.length - 1];
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
    this.#context = context;
    this.#component = component;
    this.#template = template;
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    this.#bindings = Binder.bind(this, nodes);
    this.#bindings.forEach(binding => component.bindingSummary.add(binding));
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * 
   * @param {Component} component 
   * @param {ConetextInfo} context 
   */
  setContext(component, context) {
    this.#component = component;
    this.#context = context;
    this.bindings.forEach(binding => binding.changeContext());
  }

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
    this.#removeFromParentOnNonKeyed();
/*
    if (this.component.useKeyed) {
      this.#removeFromParentOnKeyed();
    } else {
      this.#removeFromParentOnNonKeyed();
    }
*/
  }

  #removeFromParentOnNonKeyed() {
    this.#nodes.forEach(node => this.fragment.appendChild(node));
    this.bindings.forEach(binding => {
      this.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.removeFromParent());
    });
    const recycleBindingManagers = BindingManager.bindingsByTemplate.get(this.#template) ?? 
      BindingManager.bindingsByTemplate.set(this.#template, []).get(this.#template);
    recycleBindingManagers.push(this);
  }

  #removeFromParentOnKeyed() {
    // 再利用を考慮しない
    this.#nodes.forEach(node => this.fragment.appendChild(node));
    this.bindings.forEach(binding => {
      this.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.removeFromParent());
    });
  }

  dispose(isRoot = true) {
    if (isRoot) {
      this.#nodes.forEach(node => node.parentNode.removeChild(node));
    }
    this.bindings.forEach(binding => {
      this.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.dispose(false));
    });
  }

  /**
   * updateされたviewModelのプロパティをバインドしているnodeのプロパティを更新する
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  updateNode(propertyAccessByViewModelPropertyKey) {

    // templateを先に展開する
    const { bindingSummary } = this.component;
    const expandableBindings = Array.from(bindingSummary.expandableBindings);
    expandableBindings.sort((bindingA, bindingB) => {
      const result = bindingA.viewModelProperty.propertyName.level - bindingB.viewModelProperty.propertyName.level;
      if (result !== 0) return result;
      const result2 = bindingA.viewModelProperty.propertyName.pathNames.length - bindingB.viewModelProperty.propertyName.pathNames.length;
      return result2;
    });
    performance.mark('updateNode:start');
    for(const binding of expandableBindings) {
      if (!propertyAccessByViewModelPropertyKey.has(binding.viewModelProperty.key)) continue;
      binding.applyToNode();
    }
    bindingSummary.flush();
    performance.mark('updateNode:end')
    performance.measure('updateNode', 'updateNode:start', 'updateNode:end');
    console.log(performance.getEntriesByType("measure"));    
    performance.clearMeasures('updateNode');
    performance.clearMarks('updateNode:start', 'updateNode:end');

    const setOfIndexByParentKey = new Map;
    for(const propertyAccess of propertyAccessByViewModelPropertyKey.values()) {
      if (propertyAccess.propName.lastPathName !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.propName.parentPath + "\t" + propertyAccess.indexes.slice(0, propertyAccess.indexes.length - 1);
      setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
    }
    for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
      const bindings = bindingSummary.bindingsByKey.get(parentKey) ?? new Set;
      for(const binding of bindings) {
        if (!binding.expandable) continue;
        binding.applyToChildNodes(setOfIndex);
      }
    }

    for(const key of propertyAccessByViewModelPropertyKey.keys()) {
      const bindings = bindingSummary.bindingsByKey.get(key) ?? new Set;
      for(const binding of bindings) {
        if (binding.expandable) continue;
        binding.applyToNode();
      }
    }
    for(const binding of bindingSummary.componentBindings) {
      binding.nodeProperty.beforeUpdate(propertyAccessByViewModelPropertyKey);
    }

  }

  /** @type {Map<HTMLTemplateElement,BindingManager[]>} */
  static bindingsByTemplate = new Map;

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   * @returns {BindingManager}
   */
  static create(component, template, context) {
    if (true) {
      const bindingManagers = this.bindingsByTemplate.get(template) ?? [];
      if (bindingManagers.length > 0) {
        const bindingManager = bindingManagers.pop();
        bindingManager.setContext(component, context);
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
        bindingManager.bindings.forEach(binding => component.bindingSummary.add(binding));
    
        return bindingManager;
      }
    } 
    return new BindingManager(component, template, context);
  }

}