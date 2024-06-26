import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

export class ElementStyle extends ElementBase {
  /** @type {HTMLElement} */
  get htmlElement() {
    return this.node;
  }

  /** @type {string} */
  get styleName() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.htmlElement.style[this.styleName];
  }
  set value(value) {
    this.htmlElement.style[this.styleName] = value;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof HTMLElement)) utils.raise("ElementStyle: not htmlElement");
    super(binding, node, name, filters);
  }
}