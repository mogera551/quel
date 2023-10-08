import { NodeProperty } from "./NodeProperty.js";
import { Templates } from "../../view/Templates.js";

export class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement | undefined} */
  get template() {
    return Templates.templateByUUID.get(this.uuid);
  }

  /** @type {string} */
  get uuid() {
    return this.node.textContent.slice(3);
  }
}