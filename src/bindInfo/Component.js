import "../types.js";
import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Symbols } from "../viewModel/Symbols.js";
import { Component } from "../component/Component.js";

const toComponent = node => (node instanceof Component) ? node : utils.raise('not Component');

export class ComponentBind extends BindInfo {
  /**
   * @type {Node}
   */
  get node() {
    return super.node;
  }
  set node(node) {
    this.thisComponent = toComponent(node);
    super.node = node;
  }
  #isSetProperty() {
    return (typeof this.viewModelProperty !== "undefined" && typeof this.nodePropertyElements !== "undefined");
  }
  /**
   * @type {string}
   */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }
  /**
   * @type {string[]}
   */
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }
  /**
   * @type {string}
   */
  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }
  /**
   * @type {string}
   */
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  #thisComponent;
  get thisComponent() {
    return this.#thisComponent;
  }
  set thisComponent(value) {
    this.#thisComponent = value;
  }

  /**
   * 
   */
  bindProperty() {
    this.thisComponent.props[Symbols.bindProperty](this.dataProperty, this.viewModelProperty, this.indexes)
  }

  /**
   * 
   */
  updateNode() {
    const { node, dataProperty } = this;
    this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${dataProperty}`, []);
  }

  updateViewModel() {
  }

}