import { ElementProperty } from "./ElementProperty.js";

export class ElementEvent extends ElementProperty {
  /** @type {string} */
  get eventType() {
    return this.propertyName.slice(2); // on～
  }

}