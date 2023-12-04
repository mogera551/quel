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
    const lastIndexes = new Set;
    
    /** @type {BindingManager[]} */
    const newBindingManagers = values.map((value, newIndex) => {
      const lastIndex = this.#lastValue.indexOf(value, fromIndexByValue.get(value) ?? 0);
      let bindingManager;
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        bindingManager = BindingManager.create(this.binding.component, this.template, createNewContext(newIndex));
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.binding.children[lastIndex];
        fromIndexByValue.set(value, lastIndex + 1); // 
        lastIndexes.add(lastIndex);
        if (newIndex !== lastIndex) {
          bindingManager.setContext(this.binding.component, createNewContext(newIndex));
        }
      }
      return bindingManager;
    });
    for(let i = 0; i < this.binding.children.length; i++) {
      if (lastIndexes.has(i)) continue;
      this.binding.children[i].removeFromParent();
    }
    // ToDo:要検討 レーベンシュタイン距離を求めるアルゴリズムを参考にできないか
    newBindingManagers.forEach((bindingManager, index) => {
      const node = bindingManager.nodes[0];
      if (typeof node !== "undefined") {
        const beforeNode = newBindingManagers[index - 1]?.lastNode ?? this.binding.nodeProperty.node;
        if (node.previousSibling !== beforeNode) {
          console.log(`beforeNode.after`, node.previousSibling, beforeNode);
          beforeNode.after(...bindingManager.nodes);
        }
      }
    })
    this.binding.children.splice(0, this.binding.children.length, ...newBindingManagers);
    this.binding.children.forEach(applyToNodeFunc);
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
      bindingManager.removeFromParent();
      const oldValue = this.#lastValue[index];
      if (typeof oldValue !== "undefined") {
        bindingManagerByValue.set(oldValue, bindingManager);
      }
    }
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.viewModelProperty.getChildValue(index);
      const bindingManager =
        bindingManagerByValue.get(newValue) ?? 
        BindingManager.create(this.binding.component, this.template, createNewContext(index));
      this.binding.replaceChild(index, bindingManager);
    }



  }
}