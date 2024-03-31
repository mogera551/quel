import "../types.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { utils } from "../utils.js";
import { Selector } from "../binder/Selector.js";
import { Binder } from "../binder/Binder.js";
import { ReuseBindingManager } from "./ReuseBindingManager.js";
import { NewLoopContext } from "../loopContext/NewLoopContext.js";

export class Binding {
  /** @type {number} */
  static seq = 0;

  /** @type {number} id */
  #id;
  get id() {
    return this.#id;
  }

  /** @type {BindingManager} parent binding manager */
  #bindingManager;
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type { import("./nodeProperty/NodeProperty.js").NodeProperty } node property */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty
  }

  /** @type { import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty } viewmodel property */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }

  /** @type {Component} component */
  get component() {
    return this.#bindingManager.component;
  }

  /** @type {NewLoopContext} new loop context */
  get newLoopContext() {
    return this.#bindingManager.newLoopContext;
  }

  /** @type { BindingManager[] } child bindingManager for branch/repeat */
  #children = [];
  get children() {
    return this.#children;
  }

  /** @type {boolean} branch/repeat is true */
  get expandable() {
    return this.nodeProperty.expandable;
  }

  /** @type {boolean} repeat is true */
  get loopable() {
    return this.nodeProperty.loopable;
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
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  constructor(bindingManager,
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
   * apply value to node
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty } = this;
    if (component.bindingSummary.updatedBindings.has(this)) return;
    try {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
      nodeProperty.value = filteredViewModelValue;
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
    const { viewModelProperty, nodeProperty } = this;
    if (!viewModelProperty.applicable) return;
    viewModelProperty.value = nodeProperty.filteredValue;
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefaultEventHandler(event) {
    if (!this.component.bindingSummary.allBindings.has(this)) return;
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    this.component.updateSlot.addProcess(process);
  }

  /** @type {(event:Event)=>void} */
  #defaultEventHandler;
  get defaultEventHandler() {
    if (typeof this.#defaultEventHandler === "undefined") {
      this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
    }
    return this.#defaultEventHandler;
  }

  /**
   * initialize
   */
  initialize() {
    this.nodeProperty.initialize();
    this.viewModelProperty.initialize();
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
    const binding = new Binding(
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

  /** @type {NewLoopContext} */
  #newLoopContext;
  get newLoopContext() {
    return this.#newLoopContext;
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
    this.#component = component;
    this.#template = template;
    this.#newLoopContext = new NewLoopContext(this);
  }

  /**
   * 
   */
  initialize() {
    const content = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(this.#template, content);
    this.#bindings = Binder.bind(this, nodes);
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * 
   */
  registBindingsToSummary() {
    this.#bindings.forEach(binding => this.#component.bindingSummary.add(binding));
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
  postUpdateIndexForLoopContext() {
    for(const binding of this.#bindings) {
      for(const bindingManager of binding.children) {
        bindingManager.postUpdateIndexForLoopContext();
      }
    }
  }

  /**
   * updateされたviewModelのプロパティをバインドしているnodeのプロパティを更新する
   * @param {BindingManager} bindingManager
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  static updateNode(bindingManager, propertyAccessByViewModelPropertyKey) {
    const { bindingSummary } = bindingManager.component;
    bindingSummary.initUpdate();

    // expandableを先に展開する
    // バインドのツリー構造が確定する
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
      binding.nodeProperty.postUpdate(propertyAccessByViewModelPropertyKey);
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
    return bindingManager;
  }

}