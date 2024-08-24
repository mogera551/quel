import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { IBinding } from "../../@types/binding";
import { NodeProperty } from "./NodeProperty";
import { INewBinding } from "../types";

export class ElementBase extends NodeProperty {
  get element():Element {
    return this.node as Element;
  }

  constructor(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters);
  }
}