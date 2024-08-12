import { utils } from "../../utils.js";
import { ViewModelProperty } from "./ViewModelProperty_.js";

const regexp = RegExp(/^\$[0-9]+$/);

export class ContextIndex extends ViewModelProperty {
  /** @type {number} */
  get index() {
    return Number(this.name.slice(1)) - 1;
  }

  /** @type {number} */
  get value() {
    return this.binding.loopContext.allIndexes[this.index];
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
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, name, filters) {
    if (!regexp.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
    super(binding, name, filters);
  }
}