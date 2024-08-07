import { IFilterInfo } from "../../filter/types";
import { utils } from "../../utils";
import { IBinding } from "../types";
import { ElementBase } from "./ElementBase";

const PREFIX = "class.";

export class ElementClass extends ElementBase {
  get className():string {
    return this.nameElements[1];
  }

  get value():any {
    return this.element.classList.contains(this.className);
  }
  set value(value:any) {
    if (typeof value !== "boolean") utils.raise(`ElementClass: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not boolean`, );
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!name.startsWith(PREFIX)) utils.raise(`ElementClass: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}