import { NodeProperty } from "./NodeProperty";
import { utils } from "../../utils";
import { IBinding } from "../../@types/binding";
import { IFilterInfo } from "../../@types/filter";
import * as Template from "../../component/Template";

const PREFIX = "@@|";

export class TemplateProperty extends NodeProperty {
  #template:HTMLTemplateElement|undefined;
  get template():HTMLTemplateElement {
    if (typeof this.#template === "undefined") {
      this.#template = Template.getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
    }
    return this.#template;
  }

  #uuid:string|undefined;
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = TemplateProperty.getUUID(this.node);
    }
    return this.#uuid
  }

  static getUUID(node:Node):string {
    return node.textContent?.slice(PREFIX.length) ?? utils.raise("TemplateProperty: invalid node");
  }
  
  get expandable():boolean {
    return true;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    super(binding, node, name, filters);
  }
}