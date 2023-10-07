import { ElementProperty } from "./ElementProperty.js";
import { MultiValue } from "./MultiValue.js";

export class Checkbox extends ElementProperty {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return (this.node instanceof HTMLInputElement) ? this.node : utils.raise("not html input element");
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
    multiValue.value = this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters) : multiValue.value;
    return multiValue;
  }
}