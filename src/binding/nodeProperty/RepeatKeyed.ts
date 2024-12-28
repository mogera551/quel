import { utils } from "../../utils";
import { IContentBindings } from "../types";
import { createContentBindings } from "../ContentBindings";
import { Loop } from "./Loop";

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */

export class RepeatKeyed extends Loop {
  #fromIndexByValue:Map<any,number> = new Map; // 複数同じ値がある場合を考慮

  #lastIndexes:Set<number> = new Set;

  #setOfNewIndexes:Set<number> = new Set;

  #lastChildByNewIndex:Map<number,IContentBindings> = new Map;

  #lastValue:any[] = [];

  getValue():any[] {
    return this.#lastValue;
  }
  setValue(values:any):void {
    if (!Array.isArray(values)) utils.raise(`RepeatKeyed: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
    const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
    const wildCardName = this.binding.statePropertyName + ".*";
    this.revisionUpForLoop();
    this.#fromIndexByValue.clear();
    this.#lastIndexes.clear();
    this.#setOfNewIndexes.clear();
    this.#lastChildByNewIndex.clear();

    const children = this.binding.childrenContentBindings;
    const valuesLength = values.length;
    let appendOnly = true;
    for(let newIndex = 0; newIndex < valuesLength; newIndex++) {
      // values[newIndex]では、get "values.*"()を正しく取得できない
      const value = this.binding.stateProperty.getChildValue(newIndex);
      const lastIndex = this.#lastValue.indexOf(value, this.#fromIndexByValue.get(value) ?? 0);
      if (lastIndex === -1) {
        // 元のインデックスにない場合（新規）
        this.#setOfNewIndexes.add(newIndex);
      } else {
        // 元のインデックスがある場合（既存）
        this.#fromIndexByValue.set(value, lastIndex + 1); // 
        this.#lastIndexes.add(lastIndex);
        this.#lastChildByNewIndex.set(newIndex, children[lastIndex]);
        appendOnly = false;
      }
    }
    for(let i = 0; i < children.length; i++) {
      if (this.#lastIndexes.has(i)) continue;
      children[i].dispose();
    }

    const uuid = this.uuid;
    const binding = this.binding;
    if (appendOnly) {
      const nextNode = this.node.nextSibling;
      const parentNode = this.node.parentNode ?? utils.raise("parentNode is null");
      for(let vi = 0; vi < valuesLength; vi++) {
        const contentBindings = createContentBindings(uuid, binding);
        children[vi] = contentBindings;
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, vi, () => {
          contentBindings.rebuild();
        });
        parentNode.insertBefore(contentBindings.fragment, nextNode);
      }
    } else {
      let beforeContentBindings:IContentBindings|undefined;
      const parentNode:Node = this.node.parentNode ?? utils.raise("parentNode is null");
      for(let i = 0; i < valuesLength; i++) {
        const newIndex = i;
        let contentBindings:IContentBindings;
        const beforeNode = beforeContentBindings?.lastChildNode ?? this.node;
        if (this.#setOfNewIndexes.has(newIndex)) {
          // 元のインデックスにない場合（新規）
          contentBindings = createContentBindings(uuid, binding);
          children[newIndex] = contentBindings;
          this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
            contentBindings.rebuild();
          });
          parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling);
        } else {
          // 元のインデックスがある場合（既存）
          contentBindings = this.#lastChildByNewIndex.get(newIndex) ?? utils.raise("contentBindings is undefined");
          if (contentBindings.childNodes[0]?.previousSibling !== beforeNode) {
            contentBindings.removeChildNodes();
            children[newIndex] = contentBindings;
            this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
              contentBindings.rebuild();
            });
            parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling);
          } else {
            children[newIndex] = contentBindings;
            if (this.binding.updater?.isFullRebuild) {
              this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
                contentBindings.rebuild();
              });
            }
          }
        }
        beforeContentBindings = contentBindings;
      }
    }

    if (valuesLength < children.length) {
      children.length = valuesLength;
    }
    this.#lastValue = values.slice();
  }

  applyToChildNodes(setOfIndex:Set<number>):void {
    this.revisionUpForLoop();
    const uuid = this.uuid;
    const binding = this.binding;
    const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
    const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
    const wildCardName = this.binding.statePropertyName + ".*";
    const contentBindingsByValue:Map<any,IContentBindings> = new Map;
    for(const index of setOfIndex) {
      const contentBindings = this.binding.childrenContentBindings[index];
      if (typeof contentBindings === "undefined") continue;
      const oldValue = this.#lastValue[index];
      const typeofOldValue = typeof oldValue;
      if (typeofOldValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofOldValue)) continue;
      contentBindings.removeChildNodes();
      contentBindingsByValue.set(oldValue, contentBindings);
    }
    const updatedBindings = [];
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.stateProperty.getChildValue(index);
      const typeofNewValue = typeof newValue;
      if (typeofNewValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofNewValue)) continue;
      let contentBindings = contentBindingsByValue.get(newValue);
      if (typeof contentBindings === "undefined") {
        contentBindings = createContentBindings(uuid, binding);
        this.binding.replaceChildContentBindings(contentBindings, index);
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
          contentBindings?.rebuild();
        });
        updatedBindings.push(...contentBindings.allChildBindings);
      } else {
        this.binding.replaceChildContentBindings(contentBindings, index);
        this.binding.updater?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
          contentBindings?.rebuild();
        });
        updatedBindings.push(...contentBindings.allChildBindings);
      }
    }
    this.#lastValue = this.binding.stateProperty.getValue().slice();
  }

  initialize() {
    super.initialize();
    this.#lastValue = [];
  }

  dispose() {
    super.dispose();
    this.#lastValue = [];
  }
}