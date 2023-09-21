import "../types.js";
import { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Symbols } from "../Symbols.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const toComponent = node => (node[Symbols.isComponent]) ? node : utils.raise('not Component');

export class ComponentBind extends BindInfo {
  /** @type {Node} */
  get node() {
    return super.node;
  }
  set node(node) {
    this.thisComponent = toComponent(node);
    super.node = node;
  }

  /** @type {boolean} */
  #isSetProperty() {
    return (typeof this.viewModelProperty !== "undefined" && typeof this.nodePropertyElements !== "undefined");
  }

  /** @type {string} */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }

  /** @type {string[]} */
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }

  /** @type {string} */
  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }

  /** @type {string} */
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  /** @type {Component} */
  #thisComponent;
  /** @type {Component} */
  get thisComponent() {
    return this.#thisComponent;
  }
  set thisComponent(value) {
    this.#thisComponent = value;
  }

  /**
   * プロパティをバインドする
   */
  bindProperty() {
    this.thisComponent.props[Symbols.bindProperty](this.dataProperty, this.viewModelProperty, this.indexes);
    const dataProperty = this.dataProperty;
    Object.defineProperty(this.thisComponent.viewModel, dataProperty, {
      get: function () { return this.$props[dataProperty]; },
      set: function (value) { this.$props[dataProperty] = value; },
    })
  }

  /**
   * 親コンポーネントからの更新をこのコンポーネントに反映する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  applyToNode(setOfUpdatedViewModelPropertyKeys) {
    const { viewModelProperty, dataProperty } = this;
    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const [ name, indexesString ] = key.split("\t");
      const propName = PropertyName.create(name);
      if (name === viewModelProperty || propName.setOfParentPaths.has(viewModelProperty)) {
        const remain = name.slice(viewModelProperty.length);
        const indexes = ((indexesString || null)?.split(",") ?? []).map(i => Number(i));
        this.thisComponent.viewModel?.[Symbols.writeCallback](`$props.${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.writeCallback](`${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`${dataProperty}${remain}`, indexes);
      }
    }
  }

}