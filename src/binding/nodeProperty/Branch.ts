import { utils } from "../../utils";
import { IBinding } from "../../@types/binding";
import { IFilterInfo } from "../../@types/filter";
import { TemplateProperty } from "./TemplateProperty";
import { createContentBindings } from "../ContentBindings";

export class Branch extends TemplateProperty {
  get value():boolean {
    return this.binding.childrenContentBindings.length > 0;
  }

  /** 
   * Set value to bind/unbind child bindingManager
   */
  set value(value:any) {
    if (typeof value !== "boolean") utils.raise(`Branch: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not boolean`, );
    if (this.value !== value) {
      if (value) {
        const constentBindings = createContentBindings(this.template, this.binding);
        this.binding.appendChildContentBindings(constentBindings);
        constentBindings.postCreate();
      } else {
        const removedContentBindings = this.binding.removeAllChildrenContentBindings();
        removedContentBindings.forEach(constentBindings => constentBindings.dispose());
      }
    } else {
      this.binding.childrenContentBindings.forEach(constentBindings => constentBindings.applyToNode());
    }
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters);
  }

  equals(value:any):boolean {
    return false;
  }
}