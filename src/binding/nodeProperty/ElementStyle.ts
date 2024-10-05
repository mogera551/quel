import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../types";

export class ElementStyle extends ElementBase {
  get htmlElement():HTMLElement {
    return this.node as HTMLElement;
  }

  get styleName():string {
    return this.nameElements[1];
  }

  getValue():any {
    return this.htmlElement.style.getPropertyValue(this.styleName);
  }
  setValue(value:any) {
    this.htmlElement.style.setProperty(this.styleName, value);
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof HTMLElement)) utils.raise("ElementStyle: not htmlElement");
    super(binding, node, name, filters);
  }
}