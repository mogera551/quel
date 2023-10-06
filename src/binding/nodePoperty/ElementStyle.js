import { ElementProperty } from "./ElementProperty.js";

export class ElementAttribute extends ElementProperty {
  /** @type {HTMLElement} */
  get htmlElement() {
    return (node instanceof HTMLElement) ? this.node : utils.raise("not element");
  }

  /** @type {string} */
  get styleName() {
    return this.propertyNameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.htmlElement.style[this.styleName];
  }
  set value(value) {
    this.htmlElement.style[this.styleName] = value;
  }
}