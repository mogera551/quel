import { BindingManager } from "../Binding.js";
import { utils } from "../../utils.js";
import { Repeat } from "./Repeat.js";

export class RepeatKeyed extends Repeat {
  /** @type {any[]} */
  #lastValue = [];

  /** @type {number} */
  get value() {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise("RepeatKeyed: value is not array");
    const fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    const lastIndexes = new Set;
    
    /** @type {BindingManager[]} */
    let beforeBindingManager;
    /** @type {Set<number>} */
    const setOfNewIndexes = new Set;
    /** @type {Map<number,number>} */
    const lastIndexByNewIndex = new Map;
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
      const value = this.binding.viewModelProperty.getChildValue(newIndex);
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
    const newBindingManagers = values.map((value, newIndex) => {
      /** @type {BindingManager} */
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      const parentNode = this.node.parentNode;
      if (setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        const [ name, index ] = [ this.binding.viewModelProperty.name, newIndex ];
        bindingManager = BindingManager.create(this.binding.component, this.template, this.binding, { name, index });
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
      } else {
        // 元のインデックスがある場合（既存）
        const lastIndex = lastIndexByNewIndex.get(newIndex);
        bindingManager = this.binding.children[lastIndex];
        if (lastIndex !== newIndex) {
          bindingManager.thisLoopContext.index = newIndex;
        }
        bindingManager.applyToNode();
        if (bindingManager.nodes) {
          if (bindingManager.nodes[0].previousSibling !== beforeNode) {
            bindingManager.removeFromParent();
            parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
          }
        }
      }
      beforeBindingManager = bindingManager;
      return bindingManager;
    });

    this.binding.children.splice(0, this.binding.children.length, ...newBindingManagers);
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
      bindingManager.removeFromParent();
      const oldValue = this.#lastValue[index];
      if (typeof oldValue !== "undefined") {
        bindingManagerByValue.set(oldValue, bindingManager);
      }
    }
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.viewModelProperty.getChildValue(index);
      if (typeof newValue === "undefined") continue;
      let bindingManager = bindingManagerByValue.get(newValue);
      const name = this.binding.viewModelProperty.name;
      if (typeof bindingManager !== "undefined") {
        bindingManager.thisLoopContext.index = index;
        bindingManager.applyToNode();
      } else {
        bindingManager = BindingManager.create(this.binding.component, this.template, {name, index});
      }
      this.binding.replaceChild(index, bindingManager);
    }
  }
}