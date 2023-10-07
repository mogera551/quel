import { utils } from "../../utils.js";
import { ElementProperty } from "./ElementProperty.js";

export class ElementAttribute extends ElementProperty {
  /** @type {HTMLElement} */
  get htmlElement() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not htmlElement");
  }

  /** @type {string} */
  get styleName() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.htmlElement.style[this.styleName];
  }
  set value(value) {
    this.htmlElement.style[this.styleName] = value;
  }
}