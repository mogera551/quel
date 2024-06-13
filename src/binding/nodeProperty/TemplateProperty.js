import { NodeProperty } from "./NodeProperty.js";
import { utils } from "../../utils.js";
import * as Template from "../../component/Template.js";

const PREFIX = "@@|";

export class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement} */
  #template
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Template.getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
    }
    return this.#template;
  }

  /** @type {string} */
  #uuid;
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = TemplateProperty.getUUID(this.node);
    }
    return this.#uuid
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    super(binding, node, name, filters);
  }

  dispose() {
    super.dispose();
    this.#template = undefined;
    this.#uuid = undefined;
  }
}