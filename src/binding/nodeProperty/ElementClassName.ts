import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../../@types/binding";

const NAME = "class";

export class ElementClassName extends ElementBase {
  get value():any {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`ElementClassName: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`, );
    this.element.className = value.join(" ");
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== NAME) utils.raise(`ElementClassName: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}