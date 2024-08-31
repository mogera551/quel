import { utils } from "../../utils";
import { IFilterInfo } from "../../filter/types";
import { IContentBindings, IBinding } from "../types";
import { createContentBindings } from "../ContentBindings";
import { Loop } from "./Loop";

const applyToNodeFunc = (contentBindings:IContentBindings):void => contentBindings.applyToNode();

export class Repeat extends Loop {
  get value():number|(any[]) {
    return this.binding.childrenContentBindings.length;
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    this._revisionForLoop++;
    if (this.value as number < value.length) {
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
      for(let newIndex = this.value as number; newIndex < value.length; newIndex++) {
        const contentBindings = createContentBindings(this.template, this.binding);
        this.binding.appendChildContentBindings(contentBindings);
        contentBindings.postCreate();
      }
    } else if (this.value as number > value.length) {
      const removeContentBindings = this.binding.childrenContentBindings.splice(value.length);
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
      removeContentBindings.forEach(contentBindings => contentBindings.dispose());
    } else {
      this.binding.childrenContentBindings.forEach(applyToNodeFunc);
    }
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
  }

  equals(value:any):boolean {
    return false;
  }
}