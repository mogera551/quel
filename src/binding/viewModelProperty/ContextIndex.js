import { utils } from "../../utils";
import { ViewModelProperty } from "./ViewModelProperty";

const regexp = RegExp(/^\$[0-9]+$/);

export class ContextIndex extends ViewModelProperty {
  /** @type {number} */
  get index() {
    return Number(this.name.slice(1)) - 1;
  }

  /** @type {number} */
  get value() {
    return this.binding.context.indexes[this.index];
  }

  /** @type {number[]} */
  get indexes() {
    return [];
  }

  /** @type {string} */
  get indexesString() {
    return "";
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {ViewModel} viewModel 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, viewModel, name, filters, filterFuncs) {
    if (!regexp.test(name)) utils.raise(`invalid name ${name}`);
    super(binding, viewModel, name, filters, filterFuncs);
  }
}