import "../types.js";
import { Symbols } from "../Symbols.js";
import { Filter } from "../filter/Filter.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { utils } from "../utils.js";

export class Binding {
  /** @type { import("./nodePoperty/NodeProperty.js").NodeProperty } */
  nodeProperty;
  /** @type { import("./ViewModelProperty.js").ViewModelProperty } */
  viewModelProperty;
  /** @type { Filter[] } */
  filters = [];
  /** @type { Bindings[] } */
  children = [];
  /** @type {Component} */
  component;
  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
    this.#contextParam = undefined;
  }

  /** @type {ContextParam} コンテキスト情報 */
  #contextParam;
  /** @type {ContextParam} コンテキスト情報 */
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = this.viewModelProperty.propertyName;
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      }
    }
    return this.#contextParam;
  }

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty } = this;
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (nodeProperty.value !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty.name, viewModelProperty.name, filteredViewModelValue, () => {
        nodeProperty.value = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {
    const { nodeProperty, viewModelProperty } = this;
    const filteredNodelValue = nodeProperty.filteredValue;
    viewModelProperty.value = filteredNodelValue;
  }

  /**
   * 
   * @param {Event} event 
   */
  execEventHandler(event) {
    event.stopPropagation();

    const {component, viewModelProperty, context} = this;
    const process = new ProcessData(
      viewModelProperty.viewModel[Symbols.directlyCall], viewModelProperty.viewModel, [viewModelProperty.propertyName, context, event]
    );
    component.updateSlot.addProcess(process);
  }

  /**
   * 初期化
   */
  initialize() {
    this.nodeProperty.initialize(this);
    this.viewModelProperty.initialize(this);
  }
}

/** @type {Array<Binding>} */
export class Bindings extends Array {
  /** @type {Node[]} */
  nodes = [];
  /** @type {DocumentFragment} */
  fragment;
  /** @type {ContextInfo} */
  context;
  /** @type {string} */
  uuid;

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
    this.fragment = content;
    this.context = context;
    this.uuid = uuid;
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
}