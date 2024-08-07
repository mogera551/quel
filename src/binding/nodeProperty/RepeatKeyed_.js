import { BindingManager } from "../Binding.js";
import { utils } from "../../utils.js";
import { Repeat } from "./Repeat.js";

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */

export class RepeatKeyed extends Repeat {
  /** @type {Map<any,number>} */
  #fromIndexByValue = new Map; // 複数同じ値がある場合を考慮

  /** @type {Set<number>} */
  #lastIndexes = new Set;

  /** @type {Set<number>} */
  #setOfNewIndexes = new Set;

  /** @type {Map<number,BindingManager>} */
  #lastChildByNewIndex = new Map;

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
    this.#fromIndexByValue.clear();
    this.#lastIndexes.clear();
    this.#setOfNewIndexes.clear();
    this.#lastChildByNewIndex.clear();
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
      // values[newIndex]では、get "values.*"()を正しく取得できない
      const value = this.binding.viewModelProperty.getChildValue(newIndex);
      const lastIndex = this.#lastValue.indexOf(value, this.#fromIndexByValue.get(value) ?? 0);
      if (lastIndex === -1 || lastIndex === false) {
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

    /** @type {BindingManager[]} */
    const oldChildren = this.binding.children.slice(0);
    /** @type {BindingManager[]} */
    let beforeBindingManager;
    /** @type {Node} */
    const parentNode = this.node.parentNode;
    for(let i = 0; i < values.length; i++) {
      const newIndex = i;
      /** @type {BindingManager} */
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      if (this.#setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        bindingManager.postCreate();
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.#lastChildByNewIndex.get(newIndex);
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
        this.binding.replaceChild(index, bindingManager);
        bindingManager.postCreate();
      } else {
        this.binding.replaceChild(index, bindingManager);
        bindingManager.applyToNode();
      }
    }
    this.#lastValue = this.binding.viewModelProperty.value.slice();
  }

  initialize() {
    this.#lastValue = [];
  }

  dispose() {
    super.dispose();
    this.#lastValue = [];
  }
}