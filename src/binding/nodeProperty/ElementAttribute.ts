import { CleanIndexes } from "../../dotNotation/types";
import { ElementBase } from "./ElementBase";

export class ElementAttribute extends ElementBase {
  get attributeName():string {
    return this.nameElements[1];
  }

  getValue(indexes?:CleanIndexes):any {
    return this.element.getAttribute(this.attributeName);
  }
  setValue(value:any, indexes?:CleanIndexes) {
    this.element.setAttribute(this.attributeName, value);
  }
}