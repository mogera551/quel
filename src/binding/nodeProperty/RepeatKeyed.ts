import { utils } from "../../utils";
import { Repeat } from "./Repeat";
import { IContentBindings, ILoopable } from "../../@types/types";
import { createContentBindings } from "../ContentBindings";

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */

export class RepeatKeyed extends Repeat implements ILoopable {
  #fromIndexByValue:Map<any,number> = new Map; // 複数同じ値がある場合を考慮

  #lastIndexes:Set<number> = new Set;

  #setOfNewIndexes:Set<number> = new Set;

  #lastChildByNewIndex:Map<number,IContentBindings> = new Map;

  #revision = 0;
  get revision(): number {
    return this.#revision;
  }

  get loopable():boolean {
    return true;
  }

  #lastValue:any[] = [];

  get value():any[] {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise(`RepeatKeyed: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
    this.#revision++;
    this.#fromIndexByValue.clear();
    this.#lastIndexes.clear();
    this.#setOfNewIndexes.clear();
    this.#lastChildByNewIndex.clear();
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
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
        this.#lastChildByNewIndex.set(newIndex, this.binding.childrenContentBindings[lastIndex]);
      }
    }
    for(let i = 0; i < this.binding.childrenContentBindings.length; i++) {
      if (this.#lastIndexes.has(i)) continue;
      this.binding.childrenContentBindings[i].dispose();
    }

    const oldChildren:IContentBindings[] = this.binding.childrenContentBindings.slice(0);
    let beforeContentBindings:IContentBindings|undefined;
    const parentNode:Node = this.node.parentNode ?? utils.raise("parentNode is null");
    for(let i = 0; i < values.length; i++) {
      const newIndex = i;
      let contentBindings:IContentBindings;
      const beforeNode = beforeContentBindings?.lastChildNode ?? this.node;
      if (this.#setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        contentBindings = createContentBindings(this.template, this.binding);
        (newIndex < this.binding.childrenContentBindings.length) ? 
          (this.binding.childrenContentBindings[newIndex] = contentBindings) : 
          this.binding.childrenContentBindings.push(contentBindings);
        parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
        contentBindings.postCreate();
      } else {
        // 元のインデックスがある場合（既存）
        contentBindings = this.#lastChildByNewIndex.get(newIndex) ?? utils.raise("contentBindings is undefined");
        if (contentBindings.childNodes[0]?.previousSibling !== beforeNode) {
          contentBindings.removeChildNodes();
          parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
        }
        (newIndex < this.binding.childrenContentBindings.length) ? 
          (this.binding.childrenContentBindings[newIndex] = contentBindings) : 
          this.binding.childrenContentBindings.push(contentBindings);
        contentBindings.applyToNode();
      }
      beforeContentBindings = contentBindings;
    }
    if (values.length < this.binding.childrenContentBindings.length) {
      this.binding.childrenContentBindings.length = values.length;
    }
    this.#lastValue = values.slice();
  }

  applyToChildNodes(setOfIndex:Set<number>) {
    this.#revision++;
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
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.stateProperty.getChildValue(index);
      const typeofNewValue = typeof newValue;
      if (typeofNewValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofNewValue)) continue;
      let contentBindings = contentBindingsByValue.get(newValue);
      if (typeof contentBindings === "undefined") {
        contentBindings = createContentBindings(this.template, this.binding);
        this.binding.replaceChildContentBindings(contentBindings, index);
        contentBindings.postCreate();
      } else {
        this.binding.replaceChildContentBindings(contentBindings, index);
        contentBindings.applyToNode();
      }
    }
    this.#lastValue = this.binding.stateProperty.value.slice();
  }

  initialize() {
    this.#lastValue = [];
  }

  dispose() {
    super.dispose();
    this.#lastValue = [];
  }
}