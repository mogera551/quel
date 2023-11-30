import { BindingManager } from "../Binding.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { Repeat } from "./Repeat.js";

/**
 * 
 * @param {BindingManager} bindingManager 
 * @returns 
 */
const applyToNodeFunc = bindingManager => bindingManager.applyToNode();

export class RepeatKeyed extends Repeat {
  /** @type {any[]} */
  #lastValue = [];

  /** @type {number} */
  get value() {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise("value is not array");
    const createNewContext = index => this.binding.viewModelProperty.createChildContext(index);
    const fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    const lastIndexByNewIndex = new Map;
    const insertOrMoveIndexes = [];
    const lastIndexes = new Set;
    /** @type {BindingManager[]} */
    const newBindingManagers = values.map((value, newIndex) => {
      const lastIndex = this.#lastValue.indexOf(value, fromIndexByValue.get(value) ?? 0);
      let bindingManager;
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        lastIndexByNewIndex.set(newIndex, undefined);
        insertOrMoveIndexes.push(newIndex);
        bindingManager = BindingManager.create(this.binding.component, this.template, createNewContext(newIndex));
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.binding.children[lastIndex];
        fromIndexByValue.set(value, lastIndex + 1); // 
        lastIndexByNewIndex.set(newIndex, lastIndex);
        lastIndexes.add(lastIndex);
        if (newIndex !== lastIndex) {
          bindingManager.setContext(this.binding.component, createNewContext(newIndex));
        }
        const prevLastIndex = lastIndexByNewIndex.get(newIndex - 1);
        if (newIndex !== 0 && (typeof prevLastIndex === "undefined" || prevLastIndex > lastIndex)) {
          insertOrMoveIndexes.push(newIndex);
        }
      }
      return bindingManager;
    });
    for(let i = 0; i < this.binding.children.length; i++) {
      if (lastIndexes.has(i)) continue;
      this.binding.children[i].removeFromParent();
    }
    for(const index of insertOrMoveIndexes) {
      const bindingManager = newBindingManagers[index];
      const beforeNode = newBindingManagers[index - 1]?.lastNode ?? this.binding.nodeProperty.node;
      beforeNode.after(...bindingManager.nodes);
    }
    this.binding.children.splice(0, this.binding.children.length, ...newBindingManagers);
    this.binding.children.forEach(applyToNodeFunc);
    this.#lastValue = values.slice();
  }

}