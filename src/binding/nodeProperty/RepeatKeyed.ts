import { BindingManager } from "../Binding";
import { utils } from "../../utils";
import { Repeat } from "./Repeat";
import { IBindingManager } from "../types";

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */

export class RepeatKeyed extends Repeat {
  #fromIndexByValue:Map<any,number> = new Map; // 複数同じ値がある場合を考慮

  #lastIndexes:Set<number> = new Set;

  #setOfNewIndexes:Set<number> = new Set;

  #lastChildByNewIndex:Map<number,IBindingManager> = new Map;

  get loopable():boolean {
    return true;
  }

  #lastValue:any[] = [];

  get value():any[] {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise(`RepeatKeyed: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
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
        this.#lastChildByNewIndex.set(newIndex, this.binding.children[lastIndex]);
      }
    }
    for(let i = 0; i < this.binding.children.length; i++) {
      if (this.#lastIndexes.has(i)) continue;
      this.binding.children[i].dispose();
    }

    const oldChildren:IBindingManager[] = this.binding.children.slice(0);
    let beforeBindingManager:IBindingManager|undefined;
    const parentNode:Node = this.node.parentNode ?? utils.raise("parentNode is null");
    for(let i = 0; i < values.length; i++) {
      const newIndex = i;
      let bindingManager:IBindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      if (this.#setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
        parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        bindingManager.postCreate();
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.#lastChildByNewIndex.get(newIndex) ?? utils.raise("bindingManager is undefined");
        if (bindingManager.nodes?.[0]?.previousSibling !== beforeNode) {
          bindingManager.removeNodes();
          parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        }
        (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
        bindingManager.applyToNode();
      }
      beforeBindingManager = bindingManager;
    }
    if (values.length < this.binding.children.length) {
      this.binding.children.length = values.length;
    }
    this.#lastValue = values.slice();
  }

  applyToChildNodes(setOfIndex:Set<number>) {
    const bindingManagerByValue:Map<any,IBindingManager> = new Map;
    for(const index of setOfIndex) {
      const bindingManager = this.binding.children[index];
      if (typeof bindingManager === "undefined") continue;
      const oldValue = this.#lastValue[index];
      const typeofOldValue = typeof oldValue;
      if (typeofOldValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofOldValue)) continue;
      bindingManager.removeNodes();
      bindingManagerByValue.set(oldValue, bindingManager);
    }
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.stateProperty.getChildValue(index);
      const typeofNewValue = typeof newValue;
      if (typeofNewValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofNewValue)) continue;
      let bindingManager = bindingManagerByValue.get(newValue);
      if (typeof bindingManager === "undefined") {
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.replaceChild(index, bindingManager);
        bindingManager.postCreate();
      } else {
        this.binding.replaceChild(index, bindingManager);
        bindingManager.applyToNode();
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