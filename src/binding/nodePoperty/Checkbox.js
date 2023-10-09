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
    multiValue.value = this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters, this.inputFilterFuncs) : multiValue.value;
    return multiValue;
  }

  /**
   * 
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(node, name, filters, inputFilterFuncs) {
    if (!(node instanceof HTMLInputElement)) utils.raise("not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("not checkbox");
    super(node, name, filters, inputFilterFuncs);
  }
}