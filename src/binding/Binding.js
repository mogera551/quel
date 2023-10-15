import "../types.js";
import { Symbols } from "../Symbols.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
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

  /** @type { Bindings[] } */
  children = [];

  /**
   * 
   * @param {Component} component 
   * @param {import("./nodePoperty/NodeProperty.js").NodeProperty} nodeProperty 
   * @param {import("./ViewModelProperty.js").ViewModelProperty} viewModelProperty 
   */
  constructor(component, nodeProperty, viewModelProperty) {
    this.#component = component;
    this.#nodeProperty = nodeProperty;
    this.#viewModelProperty = viewModelProperty;
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
    event.stopPropagation();

    const {component, viewModelProperty} = this;
    const process = new ProcessData(
      viewModelProperty.viewModel[Symbols.directlyCall], viewModelProperty.viewModel, [viewModelProperty.propertyName, viewModelProperty.context, event]
    );
    component.updateSlot.addProcess(process);
  }

  /**
   * @param {(event:Event)=>void}
   */
  getExecEventHandler() {
    const binding = this;
    return event => binding.execEventHandler(event);
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefautEventHandler(event) {
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    component.updateSlot.addProcess(process);
  }

  /**
   * @param {(event:Event)=>void}
   */
  getExecDefaultEventHandler() {
    const binding = this;
    return event => binding.execDefautEventHandler(event);
  }

  /**
   * 初期化
   */
  initialize() {
    this.nodeProperty.initialize(this);
    this.viewModelProperty.initialize(this);
    this.applyToNode();
  }

  /**
   * 
   * @param {Node} node 
   * @returns {Node}
   */
  appear(node) {
    return this.children.reduce((node, bindings) => bindings.appear(node), node);
  }

  /**
   * 
   */
  disappear() {
    this.children.forEach(bindings => bindings.disappear());
  }
}

/** @type {Array<Binding>} */
export class Bindings extends Array {

  /** @type {Node[]} */
  nodes = [];

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

  /** @type {string} */
  #uuid;
  get uuid() {
    return this.#uuid;
  }

  /**
   * 
   * @param {Component} component
   * @param {string} uuid
   * @param {ContextInfo} context
   */
  constructor(component, uuid, context) {
    const template = Templates.templateByUUID.get(uuid);
    const { binds, content } = ViewTemplate.render(component, template, context);
    this.push(...binds);
    this.nodes = Array.from(content.childNodes);
    this.#fragment = content;
    this.#context = context;
    this.#uuid = uuid;
  }

  /**
   * 
   */
  applyToNode() {
    this.forEach(binding => binding.applyToNode());
  }

  /**
   * 
   */
  applyToViewModel() {
    this.forEach(binding => binding.applyToViewModel());
  }

  /**
   * @param {Node} node
   * @return {Node}
   */
  appear(node) {
    node.appendChild(this.fragment);
    return this.reduce((node, binding) => binding.appear(node), this.nodes[this.nodes.length - 1]);
  }

  /**
   * 
   */
  disappear() {
    const fragment = this.fragment;
    this.nodes.forEach(node => fragment.appendChild(node));
    this.forEach(binding => binding.disappear())
  }
}