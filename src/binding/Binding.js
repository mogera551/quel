import "../types.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { utils } from "../utils.js";
import { bindingManagersByUUID, createBindingManager } from "./ReuseBindingManager.js";
import { LoopContext } from "../loopContext/LoopContext.js";
import { Binder } from "../newBinder/Binder.js";
import { fragmentsByUUID } from "./ReuseFragment.js";
import { reuseBindings } from "./ReuseBinding.js";
import { createNodeProperty } from "./ReuseNodeProperty.js";
import { createViewModelProperty } from "./ReuseViewModelProperty.js";

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
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
   * @param {FilterInfo[]} filters
   */
  constructor(bindingManager,
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor,
    filters
  ) {
    this.assign(bindingManager, node, nodePropertyName, nodePropertyConstructor, viewModelPropertyName, viewModelPropertyConstructor, filters);
  }

  /**
   * for reuse
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
   * @param {FilterInfo[]} filters
   * @returns {Binding}
   */
  assign(bindingManager, 
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor, filters) {
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = createNodeProperty(nodePropertyConstructor, [this, node, nodePropertyName, filters]);
    this.#viewModelProperty = createViewModelProperty(viewModelPropertyConstructor, [this, viewModelPropertyName, filters]);
    return this;
  }

  /**
   * apply value to node
   */
  applyToNode() {
    if (this.component.bindingSummary.updatedBindings.has(this)) return;
    const { component, nodeProperty, viewModelProperty } = this;
    try {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
//      console.log(`node.${this.#nodeProperty.name} = viewModel.${this.#viewModelProperty.propertyName.name}`);
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

  dispose() {
    for(let i = 0; i < this.children.length; i++) {
      this.children[i].dispose();
    }
    this.children.length = 0;
    this.component.bindingSummary.delete(this);
    this.#nodeProperty.dispose();
    this.#viewModelProperty.dispose();

    this.#bindingManager = undefined;
    this.#nodeProperty = undefined;
    this.#viewModelProperty = undefined;

    reuseBindings.push(this); // reuse
  }

  /**
   * create Binding
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor
   * @param {FilterInfo[]} filters
   */
  static create(bindingManager,
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor,
    filters
  ) {
    const binding = reuseBindings.pop()?.assign(bindingManager,
      node, nodePropertyName, nodePropertyConstructor, 
      viewModelPropertyName, viewModelPropertyConstructor,
      filters) ?? 
      Reflect.construct(Binding, [bindingManager,
        node, nodePropertyName, nodePropertyConstructor, 
        viewModelPropertyName, viewModelPropertyConstructor,
        filters]);
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
  set fragment(value) {
    this.#fragment = value;
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

  /** @type {string} */
  #uuid;
  get uuid() {
    return this.#uuid;
  }

  /** @type {(node:Node)=>void} */
  #appendNodeToFragment;

  /** @type {(binding:Binding)=>void} */ 
  #addToBindingSummary
  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {Binding|undefined} parentBinding
   */
  constructor(component, template, uuid, parentBinding) {
    this.assign(component, template, uuid, parentBinding);
  }

  /**
   * for reuse
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @param {string} uuid 
   * @param {Binding|undefined} parentBinding 
   * @returns {BindingManager}
   */
  assign(component, template, uuid, parentBinding) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
    this.#bindingSummary = component.bindingSummary;
    this.#uuid = uuid;
    this.#addToBindingSummary = addBindingTo(this.#bindingSummary)

    return this;
  }

  /**
   * 
   */
  initialize() {
    const binder = Binder.create(this.#template, this.#component.useKeyed);
    this.#fragment = fragmentsByUUID[this.#uuid]?.pop() ??
      document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#bindings = binder.createBindings(this.#fragment, this);
    this.#nodes = Array.from(this.#fragment.childNodes);
    this.#appendNodeToFragment = appendNodeTo(this.#fragment);
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#addToBindingSummary(this.#bindings[i]);
    }
  }

  /**
   * apply value to node
   */
  applyToNode() {
    // apply value to node exluding select tag, and apply select tag value
    const selectBindings = [];
    for(let i = 0; i < this.#bindings.length; i++) {
      const binding = this.#bindings[i];
      if (binding.isSelectValue) {
        selectBindings.push(binding);
      } else {
        binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
  }

  /**
   * apply value to ViewModel
   */
  applyToViewModel() {
    for(let i = 0; i < this.#bindings.length; i++) {
      applyToViewModel(this.#bindings[i]);
    }
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    for(let i = 0; i < this.#nodes.length; i++) {
      this.#appendNodeToFragment(this.#nodes[i]);
    }
  }

  /**
   * 
   */
  dispose() {
    this.removeNodes(); // append nodes to fragment
    for(let i = 0; i < this.bindings.length; i++) {
      this.bindings[i].dispose();
    }
    this.bindings.length = 0;

    const uuid = this.#uuid;
    const fragment = this.#fragment;

    this.#parentBinding = undefined;
    this.#component = undefined;
    this.#template = undefined;
    this.#loopContext = undefined;
    this.#bindingSummary = undefined;
    this.#uuid = undefined;
    this.#fragment = undefined;

    // reuse fragment
    fragmentsByUUID[uuid]?.push(fragment) ??
      (fragmentsByUUID[uuid] = [fragment]);
    bindingManagersByUUID[uuid]?.push(this) ??
      (bindingManagersByUUID[uuid] = [this]);
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
      const selectBindings = [];
      const keys = propertyAccessByViewModelPropertyKey.keys();
      for(let i = 0; i < keys.length; i++) {
        const bindings = bindingSummary.bindingsByKey.get(keys[i]);
        if (typeof bindings === "undefined") continue;
        for(let j = 0; j < bindings.length; j++) {
          const binding = bindings[j];
          if (binding.expandable) continue;
          binding.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
        }
      }
      for(let i = 0; i < selectBindings.length; i++) {
        selectBindings[i].applyToNode();
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
   * @param {string} uuid
   * @param {Binding|undefined} parentBinding
   * @returns {BindingManager}
   */
  static create(component, template, uuid, parentBinding) {
    return createBindingManager(component, template, uuid, parentBinding);
  }

}