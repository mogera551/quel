import { MultiValue } from "./MultiValue.js";
import { Filter } from "../../filter/Filter.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

export class Radio extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.element;
  }

  /** @type {MultiValue} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }
  /** @param {any} value */
  set value(value) {
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  /** @type {MultiValue} */
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    return new MultiValue(
      this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters) : multiValue.value, 
      multiValue.enabled
    );
  }
  
  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
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