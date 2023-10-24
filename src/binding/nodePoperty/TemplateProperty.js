import { NodeProperty } from "./NodeProperty.js";
import { Templates } from "../../view/Templates.js";
import { utils } from "../../utils.js";

export class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement | undefined} */
  get template() {
    return Templates.templateByUUID.get(this.uuid);
  }

  /** @type {string} */
  get uuid() {
    return TemplateProperty.getUUID(this.node);
  }

  /**
   * 
   * @param {Node} node 
   * @returns {string}
   */
  static getUUID(node) {
    return node.textContent.slice(3)
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
    if (!(node instanceof Comment)) utils.raise("not Comment");
    const uuid = TemplateProperty.getUUID(node);
    if (typeof uuid === "undefined") utils.raise(`invalid uuid ${uuid}`);
    super(binding, node, name, filters, filterFuncs);
  }
}