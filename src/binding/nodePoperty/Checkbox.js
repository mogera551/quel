import { ElementProperty } from "./ElementProperty.js";
import { MultiValue } from "./MultiValue.js";
import { Filter } from "../../filter/Filter.js";
import { utils } from "../../utils.js";

export class Checkbox extends ElementProperty {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {any} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }
  set value(value) {
    /** @type {Array} */
    const array = value;
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = array.find(v => v === multiValue.value) ? true : false;
  }

  /** @type {any} */
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
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof HTMLInputElement)) utils.raise("not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("not checkbox");
    super(binding, node, name, filters, filterFuncs);
  }
}