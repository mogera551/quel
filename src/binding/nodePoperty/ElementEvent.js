import { ElementProperty } from "./ElementProperty.js";

export class ElementEvent extends ElementProperty {
  /** @type {string} */
  get eventType() {
    return this.name.slice(2); // on～
  }

  /** @type {boolean} */
  get applicable() {
    return false;
  }

  /**
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
    this.element.addEventListener(this.eventType, (event) => {
      binding.execEventHandler(event);
    });
  }

}