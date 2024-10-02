import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../types";
import { CleanIndexes } from "../../dotNotation/types";

const PREFIX = "class.";

export class ElementClass extends ElementBase {
  get className():string {
    return this.nameElements[1];
  }

  getValue():any {
    return this.element.classList.contains(this.className);
  }
  setValue(value:any) {
    if (typeof value !== "boolean") utils.raise(`ElementClass: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not boolean`, );
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!name.startsWith(PREFIX)) utils.raise(`ElementClass: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}