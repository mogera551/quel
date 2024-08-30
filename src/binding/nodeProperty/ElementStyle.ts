import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../../@types/binding";

export class ElementStyle extends ElementBase {
  get htmlElement():HTMLElement {
    return this.node as HTMLElement;
  }

  get styleName():string {
    return this.nameElements[1];
  }

  get value():any {
    return this.htmlElement.style.getPropertyValue(this.styleName);
  }
  set value(value:any) {
    this.htmlElement.style.setProperty(this.styleName, value);
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof HTMLElement)) utils.raise("ElementStyle: not htmlElement");
    super(binding, node, name, filters);
  }
}