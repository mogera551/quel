import { ElementProperty } from "./ElementProperty.js";

export class ElementClassName extends ElementProperty {
  /** @type {any} */
  get value() {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  set value(value) {
    this.element.className = value.join(" ");
  }
}