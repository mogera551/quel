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
   * @param {Object<string,FilterFunc>} filterFuncs
   * @param {Object<string,EventFilterFunc>} eventFilterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs, eventFilterFuncs) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters, filterFuncs, eventFilterFuncs);
  }
}