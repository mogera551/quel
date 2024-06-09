import "../types.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { utils } from "../utils.js";
import * as Selector from "../binder/Selector.js";
import * as Binder from "../binder/Binder.js";
import { ReuseBindingManager } from "./ReuseBindingManager.js";
import { LoopContext } from "../loopContext/LoopContext.js";

let seq = 0;

export class Binding {
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

  /** @type {LoopContext} new loop context */
  get loopContext() {
    return this.#bindingManager.loopContext;
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

  /** @type {boolean} for select tag value */
  #isSelectValue;
  get isSelectValue() {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.nodeProperty.isSelectValue;
    }
    return this.#isSelectValue;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {FilterInfo[]} filters
   */
  constructor(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = new classOfNodeProperty(this, node, nodePropertyName, filters);
    this.#viewModelProperty = new classOfViewModelProperty(this, viewModelPropertyName, filters);
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
   * apply value to child nodes
   * @param {Set<number>} setOfIndex 
   */
  applyToChildNodes(setOfIndex) {
    this.nodeProperty.applyToChildNodes(setOfIndex);

  }

  /**
   * ViewModelへ値を反映する
   * apply value to ViewModel
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
   * create Binding
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {FilterInfo[]} filters
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

/** @type {(fragment:DocumentFragment)=>(node:Node)=>void} */
const appendNodeTo = fragment => node => fragment.appendChild(node);

/** @type {(binding:Binding)=>void} */
const applyToViewModel = binding => binding.applyToViewModel();

/** @type {(binding:Binding)=>void} */
const applyToNode = binding => binding.applyToNode();

/** @type {(selectBindings:Binding[],binding:Binding)=>Binding[]} */
const applyToNodeExcludeSelectFunc = (selectBindings, binding) => 
  (binding.isSelectValue ? selectBindings.push(binding) : applyToNode(binding), selectBindings);

/** @type {(bindingSummary:BindingSummary)=>(binding:Binding)=>void} */
const addBindingTo = bindingSummary => binding => bindingSummary.add(binding);

/** @type {(node:Node)=>boolean} */
const filterElement = node => node.nodeType === Node.ELEMENT_NODE;

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

  /** @type {Element[]} */
  get elements() {
    return this.#nodes.filter(filterElement);
  }

  /** @type {Node} */
  get lastNode() {
    return this.#nodes[this.#nodes.length - 1];
  }

  /** @type {DocumentFragment} */
  #fragment;
  get fragment() {
    return this.#fragment;
  }

  /** @type {LoopContext} */
  #loopContext;
  get loopContext() {
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

  /** @type {BindingSummary} */
  #bindingSummary;

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   */
  constructor(component, template, parentBinding) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
    this.#bindingSummary = component.bindingSummary;
  }

  /**
   * 
   */
  initialize() {
    const content = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    const selectedNodes = Selector.getTargetNodes(this.#template, content);
    this.#bindings = Binder.bind(this, selectedNodes);
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    const addToBindingSummary = addBindingTo(this.#bindingSummary);
    this.#bindings.forEach(addToBindingSummary);
  }

  /**
   * apply value to node
   */
  applyToNode() {
    this.#bindings.reduce(applyToNodeExcludeSelectFunc, []).forEach(applyToNode);
  }

  /**
   * apply value to ViewModel
   */
  applyToViewModel() {
    this.#bindings.forEach(applyToViewModel);
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    const appnedNodeToFragment = appendNodeTo(this.#fragment);
    this.#nodes.forEach(appnedNodeToFragment);
  }

  /**
   * 
   */
  dispose() {
    ReuseBindingManager.dispose(this);
  }

  /**
   * updated viewModel properties are updated to node properties
   * @param {BindingManager} bindingManager
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  static updateNode(bindingManager, propertyAccessByViewModelPropertyKey) {
    const { bindingSummary } = bindingManager.component;
    const expand = () => {
      bindingSummary.initUpdate();

      // expandable bindings are expanded first
      // bind tree structure is determined
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
    };
    expand();

    const applyToChildNodes = () => {
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
      bindingManager.component.contextRevision++;
    };
    applyToChildNodes();

    const applyToNode = () => {
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
    };
    applyToNode();

  }

  /**
   * create BindingManager
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding) {
    const bindingManager = ReuseBindingManager.create(component, template, parentBinding);
    return bindingManager;
  }

  /**
   * 
   * @param {Component} component 
   * @returns {BindingManager|undefined}
   */
  static getByComponent(component) {
    if (component.parentComponent === null) return;
    /**
     * traverse binding tree
     * @param {BindingManager} bindingManager 
     * @param {Map<Element,BindingManager>} bindingManagerByElement 
     */
    const traverse = function(bindingManager, bindingManagerByElement) {
      bindingManager.elements.forEach(element => {
        bindingManagerByElement.set(element, bindingManager);
      });
      for(const binding of bindingManager.bindings) {
        binding.children.forEach(childBindingManager => traverse(childBindingManager, bindingManagerByElement));
      }
    }
    const bindingManagerByElement = new Map;
    traverse(component.parentComponent.rootBinding, bindingManagerByElement);
    /**
     * element to parent component
     * @param {Component} component 
     * @param {Element} element 
     * @returns {Element[]}
     */
    function getPath(component, element) {
      const path = [];
      while(element !== null && element !== component) {
        path.push(element);
        element = element.parentElement;
      }
      return path;
    }
    const path = getPath(component.parentComponent, component);
    for(const element of path) {
      const bindingManager = bindingManagerByElement.get(element);
      if (typeof bindingManager !== "undefined") return bindingManager;
    }
  }
}