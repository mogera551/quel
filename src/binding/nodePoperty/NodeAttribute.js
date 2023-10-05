import { utils } from "../../utils.js";
import { NodeProperty } from "./NodeProperty.js";

export class NodeAttribute extends NodeProperty {
  /** @type {Element} */
  get element() {
    return (node instanceof Element) ? this.node : utils.raise("not element");
  }

  /** @type {string} */
  get attributeName() {
    return this.propertyNameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.element.getAttribute(this.attributeName);
  }
  set value(value) {
    this.element.setAttribute(this.attributeName, value);
  }

}