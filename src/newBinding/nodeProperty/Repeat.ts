import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { TemplateProperty } from "./TemplateProperty";
import { IContentBindings, INewBinding } from "../types";
import { createContentBindings } from "../ContentBindings";

const applyToNodeFunc = (contentBindings:IContentBindings):void => contentBindings.applyToNode();

export class Repeat extends TemplateProperty {
  get loopable():boolean {
    return true;
  }

  get value():number|(any[]) {
    return this.binding.childrenContentBindings.length;
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.component.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    if (this.value as number < value.length) {
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
      for(let newIndex = this.value as number; newIndex < value.length; newIndex++) {
        const contentBindings = createContentBindings(this.template, this.binding);
        this.binding.appendChildContentBindings(contentBindings);
        // contentBindings.postCreate();
      }
    } else if (this.value as number > value.length) {
      const removeContentBindings = this.binding.childrenContentBindings.splice(value.length);
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
      removeContentBindings.forEach(contentBindings => contentBindings.dispose());
    } else {
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
    }
  }

  constructor(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}