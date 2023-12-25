import "../types.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { utils } from "../utils.js";
import { Selector } from "../binder/Selector.js";
import { Binder } from "../binder/Binder.js";
import { ReuseBindingManager } from "./ReuseBindingManager.js";
import { LoopContext } from "../loopContext/LoopContext.js";

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

  /** @type {LoopContext|undefined} */
  get loopContext() {
    return this.#bindingManager.loopContext;
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

  /** @type {LoopContext} */
  get loopContext() {
    return this.#bindingManager.loopContext;
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
    const { component, nodeProperty, viewModelProperty } = this;
    if (component.bindingSummary.updatedBindings.has(this)) {
      return;
    } 
    //console.log(`binding.applyToNode() ${nodeProperty.node?.tagName} ${nodeProperty.name} ${viewModelProperty.name} ${viewModelProperty.indexesString}`);
    try {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
      nodeProperty.assignFromViewModelValue();
    } finally {
      component.bindingSummary.updatedBindings.add(this);
    }
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
    if (!this.component.bindingSummary.allBindings.has(this)) {
      //console.log(`binding(${this.id}) is already deleted`);
      return;
    }
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
    if (!this.expandable) utils.raise("Binding.appendChild: not expandable");
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
    if (!this.expandable) utils.raise("Binding.replaceChild: not expandable");
    const lastChild = this.children[index - 1];
    this.children[index] = bindingManager;
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
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
    binding.initialize();
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

  /** @type {LoopContext|undefined} */
  #loopContext;
  get loopContext() {
    return this.#loopContext ?? this.#parentBinding?.loopContext;
  }

  /** @type {LoopContext|undefined} */
  get thisLoopContext() {
    return this.#loopContext;
  }

  /** @type {HTMLTemplateElement} */
  #template;
  get template() {
    return this.#template;
  }

  /** @type {Binding} */
  #parentBinding;
  get parentBinding() {
    return this.#parentBinding;
  }
  set parentBinding(value) {
    this.#parentBinding = value;
  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   */
  constructor(component, template, parentBinding, loopInfo) {
    this.#parentBinding = parentBinding;
    this.#loopContext = loopInfo ? new LoopContext(this, loopInfo.name, loopInfo.index) : undefined;
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
   */
  applyToNode() {
    const selectBindings = new Set;
    for(const binding of this.bindings) {
      binding.isSelectValue ? selectBindings.add(binding) : binding.applyToNode();
    }
    for(const binding of selectBindings) {
      binding.applyToNode();
    }
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
  removeNodes() {
    this.#nodes.forEach(node => this.fragment.appendChild(node));
  }

  /**
   * 
   */
  dispose() {
    ReuseBindingManager.dispose(this);
  }

  /**
   * 
   */
  updateLoopContext() {
    if (typeof this.#loopContext !== "undefined") {
      this.#loopContext.updateDirty();
    }
    for(const binding of this.#bindings) {
      for(const bindingManager of binding.children) {
        bindingManager.updateLoopContext();
      }
    }
  }

  /**
   * 
   * @param {{name:string,index:number}|undefined} loopInfo 
   */
  replaceLoopContext(loopInfo) {
    this.#loopContext = loopInfo ? new LoopContext(this, loopInfo.name, loopInfo.index) : undefined;
  }

  /**
   * updateされたviewModelのプロパティをバインドしているnodeのプロパティを更新する
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  updateNode(propertyAccessByViewModelPropertyKey) {
    const { bindingSummary } = this.component;
    bindingSummary.updatedBindings.clear();

    // templateを先に展開する
    const expandableBindings = Array.from(bindingSummary.expandableBindings);
    expandableBindings.sort((bindingA, bindingB) => {
      const result = bindingA.viewModelProperty.propertyName.level - bindingB.viewModelProperty.propertyName.level;
      if (result !== 0) return result;
      const result2 = bindingA.viewModelProperty.propertyName.pathNames.length - bindingB.viewModelProperty.propertyName.pathNames.length;
      return result2;
    });
    for(const binding of expandableBindings) {
      if (!propertyAccessByViewModelPropertyKey.has(binding.viewModelProperty.key)) continue;
      binding.applyToNode();
    }
    bindingSummary.flush();

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
        if (bindingSummary.updatedBindings.has(binding)) continue;
        if (!binding.expandable) continue;
        binding.applyToChildNodes(setOfIndex);
      }
    }

    const selectBindings = new Set;
    for(const key of propertyAccessByViewModelPropertyKey.keys()) {
      for(const binding of bindingSummary.bindingsByKey.get(key) ?? new Set) {
        if (binding.expandable) continue;
        binding.isSelectValue ? selectBindings.add(binding) : binding.applyToNode();
      }
    }
    for(const binding of selectBindings) {
      binding.applyToNode();
    }
    for(const binding of bindingSummary.componentBindings) {
      binding.nodeProperty.beforeUpdate(propertyAccessByViewModelPropertyKey);
    }

  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding, loopInfo) {
    const bindingManager = ReuseBindingManager.create(component, template, parentBinding, loopInfo);
    bindingManager.applyToNode();
    return bindingManager;
  }

}