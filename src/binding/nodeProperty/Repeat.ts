import { utils } from "../../utils";
import { IFilterInfo } from "../../filter/types";
import { IContentBindings, IBinding } from "../types";
import { createContentBindings } from "../ContentBindings";
import { Loop } from "./Loop";

const rebuildFunc = (contentBindings:IContentBindings):void => contentBindings.rebuild();

export class Repeat extends Loop {
  get value():any[] {
    return this.binding.childrenContentBindings;
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    const lastValueLength = this.value.length;
    this.revisionUpForLoop();
    if (lastValueLength < value.length) {
      this.binding.childrenContentBindings.forEach(rebuildFunc);
      for(let newIndex = lastValueLength; newIndex < value.length; newIndex++) {
        const contentBindings = createContentBindings(this.template, this.binding);
        this.binding.appendChildContentBindings(contentBindings);
        contentBindings.rebuild();
      }
    } else if (lastValueLength > value.length) {
      const removeContentBindings = this.binding.childrenContentBindings.splice(value.length);
      this.binding.childrenContentBindings.forEach(rebuildFunc);
      removeContentBindings.forEach(contentBindings => contentBindings.dispose());
    } else {
      this.binding.childrenContentBindings.forEach(rebuildFunc);
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