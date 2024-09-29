import { utils } from "../../utils";
import { IBinding } from "../types";
import { IFilterText } from "../../filter/types";
import { TemplateProperty } from "./TemplateProperty";
import { createContentBindings } from "../ContentBindings";
import { CleanIndexes } from "../../dotNotation/types";

export class Branch extends TemplateProperty {
  getValue(indexes?:CleanIndexes):boolean {
    return this.binding.childrenContentBindings.length > 0;
  }

  /** 
   * Set value to bind/unbind child bindingManager
   */
  setValue(value:any, indexes?:CleanIndexes):void {
    if (typeof value !== "boolean") utils.raise(`Branch: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not boolean`, );
    const lastValue = this.getValue();
    if (lastValue !== value) {
      if (value) {
        const contentBindings = createContentBindings(this.template, this.binding);
        this.binding.appendChildContentBindings(contentBindings);
        contentBindings.rebuild(indexes);
      } else {
        this.binding.removeAllChildrenContentBindings();
      }
    } else {
      this.binding.childrenContentBindings.forEach(contentBindings => contentBindings.rebuild(indexes));
    }
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters);
  }

  equals(value:any):boolean {
    return false;
  }
}