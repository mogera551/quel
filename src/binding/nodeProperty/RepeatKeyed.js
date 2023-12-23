import { BindingManager } from "../Binding.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { Repeat } from "./Repeat.js";
import { LoopContext } from "../../loopContext/LoopContext.js";

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
    if (!Array.isArray(values)) utils.raise("RepeatKeyed: value is not array");
    const fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    const lastIndexes = new Set;
    
    /** @type {BindingManager[]} */
    let beforeBindingManager;
    const newBindingManagers = values.map((value, newIndex) => {
      const lastIndex = this.#lastValue.indexOf(value, fromIndexByValue.get(value) ?? 0);
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      const parentNode = this.node.parentNode;
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        const loopContext = new LoopContext(this.binding.viewModelProperty.name, newIndex, this.binding.loopContext);
        bindingManager = BindingManager.create(this.binding.component, this.template, loopContext);
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);        
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.binding.children[lastIndex];
        fromIndexByValue.set(value, lastIndex + 1); // 
        lastIndexes.add(lastIndex);
        if (newIndex !== lastIndex) {
          bindingManager.loopContext.index = newIndex;
          bindingManager.updateLoopContext();
        }
        applyToNodeFunc(bindingManager);
        beforeNode.after(...bindingManager.nodes);
      }
      beforeBindingManager = bindingManager;
      return bindingManager;
    });
    for(let i = 0; i < this.binding.children.length; i++) {
      if (lastIndexes.has(i)) continue;
      this.binding.children[i].dispose();
    }
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
      if (typeof bindingManager !== "undefined") {
        bindingManager.loopContext.index = index;
        bindingManager.updateLoopContext();
        bindingManager.applyToNode();
      } else {
        const loopContext = new LoopContext(this.binding.viewModelProperty.name, newIndex, this.binding.loopContext);
        bindingManager = BindingManager.create(this.binding.component, this.template, loopContext);
      }
      this.binding.replaceChild(index, bindingManager);
    }
  }
}