import { utils } from "../../utils";
import { IFilterInfo } from "../../filter/types";
import { NodeProperty } from "./NodeProperty";
import { IBinding } from "../types";

export class ElementBase extends NodeProperty {
  get element():Element {
    return this.node as Element;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters);
  }
}