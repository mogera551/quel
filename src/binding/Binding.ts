import { utils } from "../utils.js";
//import { bindingManagersByUUID, createBindingManager } from "./ReuseBindingManager.js";
//import { LoopContext } from "../loopContext/LoopContext.js";
import { Binder } from "../newBinder/Binder";

let seq = 0;

export class Binding {
  #id:number = -1;
  get id() {
    return this.#id;
  }

  /** @type {BindingManager} parent binding manager */
  #bindingManager:BindingManager;
  get bindingManager() {
    return this.#bindingManager;
  }

  #nodeProperty:NodeProperty;
  get nodeProperty() {
    return this.#nodeProperty;
  }

  #stateProperty:StateProperty;
  get stateProperty() {
    return this.#stateProperty;
  }

  /** @type {Component} component */
  get component() {
    return this.#bindingManager.component;
  }

  /** @type {LoopContext} new loop context */
  get loopContext() {
    return this.#bindingManager.loopContext;
  }

  /** child bindingManager for branch/repeat */
  #children:BindingManager[] = [];
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

  /** for select tag value */
  #isSelectValue:(boolean|undefined);
  get isSelectValue() {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.nodeProperty.isSelectValue;
    }
    return this.#isSelectValue;
  }

  constructor(
    bindingManager:BindingManager,
    node:Node, 
    nodePropertyName:string, 
    nodePropertyConstructor:typeof NodeProperty, 
    state:State,
    statePropertyName:string, 
    statePropertyConstructor: typeof StateProperty,
    filters:FilterInfo[]
  ) {
    // assignを呼ぶとbindingManagerなどがundefinedになるので、constructorで初期化
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = Reflect.construct(nodePropertyConstructor, [this, node, nodePropertyName, filters]);
    this.#viewModelProperty = Reflect.construct(statePropertyConstructor, [this, state, statePropertyName, filters]);
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
    this.#nodeProperty = Reflect.construct(nodePropertyConstructor, [this, node, nodePropertyName, filters]);
    this.#viewModelProperty = Reflect.construct(viewModelPropertyConstructor, [this, viewModelPropertyName, filters]);
    return this;
  }

  /**
   * apply value to node
   */
  applyToNode({ component, nodeProperty, stateProperty } = this) {
    component.updator.applyNodeUpdatesByBinding(this, updator => {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = stateProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
      nodeProperty.value = filteredViewModelValue;
    });
  }

  /**
   * apply value to child nodes
   */
  applyToChildNodes(setOfIndex:Set<number>, { component } = this) {
    component.updator.applyNodeUpdatesByBinding(this, updator => {
      this.nodeProperty.applyToChildNodes(setOfIndex);
    });
  }

  /**
   * ViewModelへ値を反映する
   * apply value to ViewModel
   */
  applyToViewModel() {
    const { stateProperty, nodeProperty } = this;
    if (!stateProperty.applicable) return;
    stateProperty.value = nodeProperty.filteredValue;
  }

  /**
   */
  execDefaultEventHandler(event:Event) {
    if (!(this.component?.bindingSummary.exists(this) ?? false)) return;
    event.stopPropagation();
    this.component.updator.addProcess(this.applyToViewModel, this, []);
  }

  #defaultEventHandler:(((event:Event)=>void)|undefined) = undefined;
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
    this.stateProperty.initialize();
  }

  /**
   */
  appendChild(bindingManager:BindingManager) {
    if (!this.expandable) utils.raise("Binding.appendChild: not expandable");
    const lastChild = this.children[this.children.length - 1];
    this.children.push(bindingManager);
    const parentNode:Node = this.nodeProperty.node.parentNode;
    const beforeNode:Node = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   */
  replaceChild(index:number, bindingManager:BindingManager) {
    if (!this.expandable) utils.raise("Binding.replaceChild: not expandable");
    const lastChild = this.children[index - 1];
    this.children[index] = bindingManager;
    const parentNode:Node = this.nodeProperty.node.parentNode;
    const beforeNode:Node = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  dispose() {
    for(let i = 0; i < this.children.length; i++) {
      this.children[i].dispose();
    }
    this.children.length = 0;
    this.nodeProperty.dispose();
    this.stateProperty.dispose();
    this.component.bindingSummary.delete(this);
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
    const binding = Reflect.construct(Binding, [bindingManager,
        node, nodePropertyName, nodePropertyConstructor, 
        viewModelPropertyName, viewModelPropertyConstructor,
        filters]);
    binding.initialize();
    return binding;
  }
}

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

    return this;
  }

  /**
   * 
   */
  initialize() {
    const binder = Binder.create(this.#template, this.#component.useKeyed);
    this.#fragment = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#bindings = binder.createBindings(this.#fragment, this);
    this.#nodes = Array.from(this.#fragment.childNodes);
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#bindingSummary.add(this.#bindings[i]);
    }
  }

  postCreate() {
    this.registerBindingsToSummary();
    this.applyToNode();
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
      this.#bindings[i].applyToViewModel();
    }
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    for(let i = 0; i < this.#nodes.length; i++) {
      this.#fragment.appendChild(this.#nodes[i]);
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
    const uuid = this.#uuid;
    this.#parentBinding = undefined;
    this.#component = undefined;
    this.#bindingSummary = undefined;

    bindingManagersByUUID[uuid]?.push(this) ??
      (bindingManagersByUUID[uuid] = [this]);
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