import { utils } from "../../utils.js";
import { NodeProperty } from "./NodeProperty.js";

export class ElementProperty extends NodeProperty {
  /** @type {Element} */
  get element() {
    return (this.node instanceof Element) ? this.node : utils.raise("not element");
  }
}