import { BindingManager } from "../Binding.js";
import { utils } from "../../utils.js";
import { Repeat } from "./Repeat.js";

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */
/** @type {Map<any,number>} */
const fromIndexByValue = new Map; // 複数同じ値がある場合を考慮

/** @type {Set<number>} */
const lastIndexes = new Set;

/** @type {Set<number>} */
const setOfNewIndexes = new Set;

/** @type {Map<number,number>} */
const lastIndexByNewIndex = new Map;

export class RepeatKeyed extends Repeat {
  /** @type {boolean} */
  get loopable() {
    return true;
  }

  /** @type {any[]} */
  #lastValue = [];

  /** @type {number} */
  get value() {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise(`RepeatKeyed: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`);
    fromIndexByValue.clear();
    lastIndexes.clear();
    setOfNewIndexes.clear();
    lastIndexByNewIndex.clear();
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
//      const value = this.binding.viewModelProperty.getChildValue(newIndex);
      const value = values[newIndex];
      const lastIndex = this.#lastValue.indexOf(value, fromIndexByValue.get(value) ?? 0);
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        setOfNewIndexes.add(newIndex);
      } else {
        // 元のインデックスがある場合（既存）
        fromIndexByValue.set(value, lastIndex + 1); // 
        lastIndexes.add(lastIndex);
        lastIndexByNewIndex.set(newIndex, lastIndex);
      }
    }
    for(let i = 0; i < this.binding.children.length; i++) {
      if (lastIndexes.has(i)) continue;
      this.binding.children[i].dispose();
    }

    /** @type {BindingManager[]} */
    let beforeBindingManager;
    /** @type {Node} */
    const parentNode = this.node.parentNode;
    const newBindingManagers = [];
    for(let i = 0; i < values.length; i++) {
      const newIndex = i;
      /** @type {BindingManager} */
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      if (setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
      } else {
        // 元のインデックスがある場合（既存）
        const lastIndex = lastIndexByNewIndex.get(newIndex);
        bindingManager = this.binding.children[lastIndex];
        if (bindingManager.nodes?.[0]?.previousSibling !== beforeNode) {
          bindingManager.removeNodes();
          parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        }
      }
      beforeBindingManager = bindingManager;
      newBindingManagers.push(bindingManager);
    }

    this.binding.children.splice(0, this.binding.children.length, ...newBindingManagers);
    for(let i = 0; i < newBindingManagers.length; i++) {
      const bindingManager = newBindingManagers[i];
      bindingManager.registerBindingsToSummary();
      bindingManager.applyToNode()
    }
    this.#lastValue = values.slice();
  }

  /**
   * @param {Set<number>} setOfIndex
   */
  applyToChildNodes(setOfIndex) {
    /** @type {Map<any,BindingManager>} */
    const bindingManagerByValue = new Map;
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
      const newValue = this.binding.viewModelProperty.getChildValue(index);
      const typeofNewValue = typeof newValue;
      if (typeofNewValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofNewValue)) continue;
      let bindingManager = bindingManagerByValue.get(newValue);
      if (typeof bindingManager === "undefined") {
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
      }
      this.binding.replaceChild(index, bindingManager);
      bindingManager.registerBindingsToSummary();
      bindingManager.applyToNode();
    }
  }

  initialize() {
    this.#lastValue = [];
  }
}