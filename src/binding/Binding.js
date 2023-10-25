import "../types.js";
import { Symbols } from "../Symbols.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

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

  /** @type { Bindings[] } */
  children = [];

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
    event.stopPropagation();

    const {component, viewModelProperty} = this;
    const process = new ProcessData(
      viewModelProperty.viewModel[Symbols.directlyCall], 
      viewModelProperty.viewModel, 
      [viewModelProperty.propertyName, viewModelProperty.context, event]
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

  /**
   * @param {Bindings} bindings
   */
  appendChild(bindings) {
    const lastChild = this.children[this.children,length - 1];
    this.children.push(bindings);
    (lastChild?.lastNode ?? this.node).appendChild(bindings.fragment);
  }
}

/** @type {Array<Binding>} */
export class Bindings extends Array {

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
    super();
    const template = Templates.templateByUUID.get(uuid);
    const { bindings, content } = ViewTemplate.render(component, template, context);
    this.push(...bindings);
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
  }

  /**
   * 
   */
  removeFromParent() {
    this.nodes.forEach(node => this.fragment.appendChild(node));
    this.forEach(binding => binding.children.forEach(bindings => bindings.removeFromParent()));
  }
}