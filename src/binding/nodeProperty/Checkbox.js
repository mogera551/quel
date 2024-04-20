import { ElementBase } from "./ElementBase.js";
import { MultiValue } from "./MultiValue.js";
import { Filter } from "../../filter/Filter.js";
import { utils } from "../../utils.js";

export class Checkbox extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {MultiValue} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }

  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise("Checkbox: value is not array");
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = value.find(v => v === multiValue.value) ? true : false;
  }

  /** @type {MultiValue} */
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    return new MultiValue(
      this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters, this.filterFuncs) : multiValue.value, 
      multiValue.enabled
    );
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   * @param {Object<string,EventFilterFunc>} eventFilterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs, eventFilterFuncs) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("Checkbox: not checkbox");
    super(binding, node, name, filters, filterFuncs, eventFilterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}