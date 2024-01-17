import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

const PREFIX = "class.";

export class ElementClass extends ElementBase {
  /** @type {string} */
  get className() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.element.classList.contains(this.className);
  }
  set value(value) {
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
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
    if (!name.startsWith(PREFIX)) utils.raise(`ElementClass: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }
}