import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { IContentBindings, IBinding } from "../types";
import { createContentBindings } from "../ContentBindings";
import { Loop } from "./Loop";

const rebuildFunc = (contentBindings:IContentBindings):void => contentBindings.rebuild();

export class Repeat extends Loop {
  getValue():any[] {
    return this.binding.childrenContentBindings;
  }
  setValue(value:any[]):void {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    const uuid = this.uuid;
    const binding = this.binding;
    const lastValueLength = this.getValue().length;
    const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
    const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
    const wildCardName = this.binding.statePropertyName + ".*";

    this.revisionUpForLoop();
    if (lastValueLength < value.length) {
      this.binding.childrenContentBindings.forEach((contentBindings, index) => {
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
          contentBindings.rebuild();
        })
      });
      for(let newIndex = lastValueLength; newIndex < value.length; newIndex++) {
        const contentBindings = createContentBindings(uuid, binding);
        this.binding.appendChildContentBindings(contentBindings);
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
          contentBindings.rebuild();
        })
      }
    } else if (lastValueLength > value.length) {
      const removeContentBindings = this.binding.childrenContentBindings.splice(value.length);
      this.binding.childrenContentBindings.forEach((contentBindings, index) => {
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
          contentBindings.rebuild();
        })
      });
      removeContentBindings.forEach(contentBindings => contentBindings.dispose());
    } else {
      this.binding.childrenContentBindings.forEach((contentBindings, index) => {
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
          contentBindings.rebuild();
        })
      });
    }
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
  }

  equals(value:any):boolean {
    return false;
  }
}