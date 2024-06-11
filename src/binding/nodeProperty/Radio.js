import { MultiValue } from "./MultiValue.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";
import { FilterManager } from "../../filter/Manager.js";

export class Radio extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.element;
  }

  /** @type {MultiValue} */
  _value = new MultiValue(undefined, false);
  get value() {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }
  /** @param {any} value */
  set value(value) {
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
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
    if (!(node instanceof HTMLInputElement)) utils.raise("Radio: not htmlInputElement");
    if (node.type !== "radio" && node.type !== "checkbox") utils.raise("Radio: not radio or checkbox");
    super(binding, node, name, filters);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}