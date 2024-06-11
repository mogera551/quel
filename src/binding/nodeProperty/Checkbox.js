import { ElementBase } from "./ElementBase.js";
import { MultiValue } from "./MultiValue.js";
import { utils } from "../../utils.js";
import { FilterManager } from "../../filter/Manager.js";

export class Checkbox extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {MultiValue} */
  _value = new MultiValue(undefined, false);
  get value() {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }

  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise(`Checkbox: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`, );
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = value.some(v => v === multiValue.value);
  }

  /** @type {MultiValue} */
  _filteredValue = new MultiValue(undefined, false);
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("Checkbox: not checkbox");
    super(binding, node, name, filters);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}