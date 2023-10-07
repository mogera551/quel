import "../types.js";
import { Filter } from "../filter/Filter.js";
import { MultiValue } from "./nodePoperty/MultiValue.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

export class ViewModelProperty {
  /** @type { ViewModel } */
  #viewModel;
  /** @type { ViewModel } */
  get viewModel() {
    return this.#viewModel;
  }
  set viewModel(value) {
    this.#viewModel = value;
  }
  /** @type { string } */
  #name;
  /** @type { string } */
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }

  /** @type PropertyName */
  get propertyName() {
    return PropertyName.create(this.name);
  }

  /** @type {any} */
  get value() {
    return this.viewModel[this.name];
  }
  set value(value) {
    const thisValue = this.value;
    if (value instanceof MultiValue) {
      if (Array.isArray(thisValue)) {
        const setOfThisValue = new Set(thisValue);
        value.enabled ? setOfThisValue.add(value.value) : setOfThisValue.delete(value.value);
        this.viewModel[this.name] = Array.from(setOfThisValue);
      } else {
        if (value.enabled) {
          this.value = value.value;
        }
      }
    } else {
      this.viewModel[this.name] = value;
    }
  }

  /** @type {Filter[]} */
  filters;

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForOutput(this.value, this.filters) : this.value;
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {string} name 
   * @param {Filter[]} filters 
   */
  constructor(viewModel, name, filters) {
    this.viewModel = viewModel;
    this.name = name;
    this.filters = filters;
  }

  /**
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
  }
}