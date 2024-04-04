import "../types.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

export class LoopContext {
  /** @type {import("../binding/Binding.js").BindingManager} */
  #bindingManager;

  /** @type {import("../binding/Binding.js").BindingManager} */
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type {import("../binding/Binding.js").BindingManager|undefined} */
  get parentBindingManager() {
    return this.bindingManager.parentBinding?.bindingManager;
  }

  /** @type {import("../binding/Binding.js").Binding|undefined} */
  get binding() {
    return this.bindingManager.parentBinding;
  }

  /** @type {import("../binding/Binding.js").BindingManager|undefined} */
  get nearestBindingManager() {
    const prop = PropertyName.create(this.name); // ex. "list.*.detail.names.*"
    if (prop.level <= 0) return;
    const parentProp = PropertyName.create(prop.nearestWildcardParentName); // ex. "list.*.detail.names"
    const searchName = parentProp.name; // ex. "list"
    let curBindingManager = this.parentBindingManager;
    while(typeof curBindingManager !== "undefined") {
      if (curBindingManager.loopContext.binding.viewModelProperty.name === searchName) {
        return curBindingManager;
      }
      curBindingManager = curBindingManager.loopContext.parentBindingManager;
    }
  }

  /** @type {NewLoopContext|undefined} */
  get nearestLoopContext() {
    return this.nearestBindingManager?.loopContext;
  }

  /** @type {number} */
  get _index() {
    return this.binding.children.indexOf(this.#bindingManager);    
  }

  /** @type {number} */
  get index() {
    if (this.binding?.loopable) {
      return this._index;
    } else {
      // 上位のループコンテキストのインデックスを取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.index ?? -1;
    }
  }

  /** @type {string} */
  get name() {
    if (this.binding?.loopable) {
      return this.binding.viewModelProperty.name;
    } else {
      // 上位のループコンテキストの名前を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.name ?? "";
    }
  }

  /** @type {number[]} */
  get indexes() {
    if (this.binding?.loopable) {
      return this.nearestLoopContext?.indexes.concat(this.index) ?? [this.index];
    } else {
      // 上位のループコンテキストのインデクッス配列を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.indexes ?? [];
    }
  }

  /** @type {number[]} */
  get allIndexes() {
    if (typeof this.binding === "undefined") return [];
    const index = (this.binding.loopable) ? this._index : -1;
    const indexes = this.parentBindingManager.loopContext.allIndexes;
    return (index >= 0) ? indexes.concat(index) : indexes;
  }

  /**
   * 
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   */
  constructor(bindingManager) {
    this.#bindingManager = bindingManager;
  }

  /**
   * 
   * @param {string} name 
   * @returns {NewLoopContext|undefined}
   */
  find(name) {
    let loopContext = this;
    while(typeof loopContext !== "undefined") {
      if (loopContext.name === name) return loopContext;
      loopContext = loopContext.parentBindingManager.loopContext;
    }
  }
}