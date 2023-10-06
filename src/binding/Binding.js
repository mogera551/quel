import { Filter } from "../filter/Filter.js";
import "../types.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";

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

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { filters, component, nodeProperty, viewModelProperty } = this;
    const filteredViewModelValue = filters.length > 0 ? 
      Filter.applyForOutput(viewModelProperty.value, filters, component.filters.out) : viewModelProperty.value;
    if (nodeProperty.value !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty.propertyName, viewModelProperty.propertyName, filteredViewModelValue, () => {
        nodeProperty.value = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {

  }

  addEventListener() {
    const {component, element, eventType, viewModel, viewModelProperty} = this;
    element.addEventListener(eventType, (event) => {
      event.stopPropagation();
      const context = this.context;
      const process = new ProcessData(
        viewModel[Symbols.directlyCall], viewModel, [viewModelProperty, context, event]
      );
      component.updateSlot.addProcess(process);
    });
  
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
}