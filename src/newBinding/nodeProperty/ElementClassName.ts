import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { ElementBase } from "./ElementBase";
import { INewBinding } from "../types";

const NAME = "class";

export class ElementClassName extends ElementBase {
  get value():any {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`ElementClassName: ${this.binding.component.selectorName}.State['${this.binding.stateProperty.name}'] is not array`, );
    this.element.className = value.join(" ");
  }
  constructor(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== NAME) utils.raise(`ElementClassName: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}