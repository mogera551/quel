import { utils } from "../../utils.js";
import { NodeProperty } from "./NodeProperty.js";

export class ElementProperty extends NodeProperty {
  /** @type {Element} */
  get element() {
    return this.node;
  }

  /**
   * 
   * @param {Element} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(node, name, filters, inputFilterFuncs) {
    if (!(node instanceof Element)) utils.raise("not element");
    super(node, name, filters, inputFilterFuncs);
  }
}