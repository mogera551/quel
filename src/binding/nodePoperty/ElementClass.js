import { ElementProperty } from "./ElementProperty.js";

export class ElementClass extends ElementProperty {
  /** @type {string} */
  get className() {
    return this.propertyNameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.element.classList.contains(this.className);
  }
  set value(value) {
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
  }
}