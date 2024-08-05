import { utils } from "../../utils";
import { NodeProperty } from "./NodeProperty";

export class ElementBase extends NodeProperty {
  get element():Element {
    return this.node as Element;
  }

  constructor(binding:Binding, node:Node, name:string, filters:FilterInfo[]) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters);
  }
}