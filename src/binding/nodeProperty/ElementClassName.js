import { ElementBase } from "./ElementBase.js";

export class ElementClassName extends ElementBase {
  /** @type {any} */
  get value() {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  set value(value) {
    this.element.className = value.join(" ");
  }
}