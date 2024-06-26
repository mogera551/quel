import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

const NAME = "class";

export class ElementClassName extends ElementBase {
  /** @type {any} */
  get value() {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise(`ElementClassName: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`, );
    this.element.className = value.join(" ");
  }
  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== NAME) utils.raise(`ElementClassName: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}