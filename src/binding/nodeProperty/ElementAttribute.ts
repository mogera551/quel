import { ElementBase } from "./ElementBase";

export class ElementAttribute extends ElementBase {
  get attributeName():string {
    return this.nameElements[1];
  }

  get value():any {
    return this.element.getAttribute(this.attributeName);
  }
  set value(value:any) {
    this.element.setAttribute(this.attributeName, value);
  }
}