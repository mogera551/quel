import { NodeProperty } from "./NodeProperty.js";
import { Templates } from "../../view/Templates.js";
import { utils } from "../../utils.js";

const PREFIX = "@@|";

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
    return node.textContent.slice(PREFIX.length);
  }
  
  /** @type {Boolean} */
  get expandable() {
    return true;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   * @param {Object<string,EventFilterFunc>} eventFilterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs, eventFilterFuncs) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    const uuid = TemplateProperty.getUUID(node);
    const template = Templates.templateByUUID.get(uuid);
    if (typeof template === "undefined") utils.raise(`TemplateProperty: invalid uuid ${uuid}`);
    super(binding, node, name, filters, filterFuncs, eventFilterFuncs);
  }
}