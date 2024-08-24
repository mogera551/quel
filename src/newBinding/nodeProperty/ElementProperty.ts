import { ElementBase } from "./ElementBase";

export class ElementProperty extends ElementBase {
  #isSelectValue:boolean|undefined;
  get isSelectValue():boolean {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.node.constructor === HTMLSelectElement && this.name === "value";
    }
    return this.#isSelectValue;
  }
}