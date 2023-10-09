import { utils } from "../../utils.js";
import { ElementProperty } from "./ElementProperty.js";

export class ElementStyle extends ElementProperty {
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
   * @param {HTMLElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(node, name, filters, inputFilterFuncs) {
    if (!(node instanceof HTMLElement)) utils.raise("not htmlElement");
    super(node, name, filters, inputFilterFuncs);
  }
}