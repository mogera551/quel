import { utils } from "../../utils.js";
import { NodeProperty } from "./NodeProperty.js";

export class ElementBase extends NodeProperty {
  /** @type {Element} */
  get element() {
    return this.node;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Element} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(binding, node, name, filters, inputFilterFuncs) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters, inputFilterFuncs);
  }
}