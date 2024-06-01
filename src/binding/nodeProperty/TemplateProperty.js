import { NodeProperty } from "./NodeProperty.js";
import { utils } from "../../utils.js";
import * as Template from "../../component/Template.js";

const PREFIX = "@@|";

export class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement} */
  get template() {
    return Template.getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
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
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    super(binding, node, name, filters);
  }
}