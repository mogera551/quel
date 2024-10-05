import { ElementBase } from "./ElementBase";

export class ElementAttribute extends ElementBase {
  get attributeName():string {
    return this.nameElements[1];
  }

  getValue():any {
    return this.element.getAttribute(this.attributeName);
  }
  setValue(value:any) {
    this.element.setAttribute(this.attributeName, value);
  }
}