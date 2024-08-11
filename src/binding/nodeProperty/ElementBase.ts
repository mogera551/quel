import { IFilterInfo } from "../../@types/filter";
import { utils } from "../../utils";
import { IBinding } from "../../@types/binding";
import { NodeProperty } from "./NodeProperty";

export class ElementBase extends NodeProperty {
  get element():Element {
    return this.node as Element;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters);
  }
}