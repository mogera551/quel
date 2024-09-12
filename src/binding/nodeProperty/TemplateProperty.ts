import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { NodeProperty } from "./NodeProperty";
import * as Template from "../../component/Template";
import { IBinding } from "../types";

const PREFIX = "@@|";

function getUUIDFromNode(node:Node):string {
  return node.textContent?.slice(PREFIX.length) ?? utils.raise("TemplateProperty: invalid node");
}

export class TemplateProperty extends NodeProperty {
  #template?: HTMLTemplateElement;
  get template(): HTMLTemplateElement {
    if (typeof this.#template === "undefined") {
      this.#template = Template.getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
    }
    return this.#template;
  }

  #uuid?: string;
  get uuid(): string {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = getUUIDFromNode(this.node);
    }
    return this.#uuid
  }
  
  get expandable(): boolean {
    return true;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    super(binding, node, name, filters);
  }
}