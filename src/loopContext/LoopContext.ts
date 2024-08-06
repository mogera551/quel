import { IBindingManager, IBinding } from "../binding/types.js";
import { getPatternNameInfo } from "../dot-notation/PatternName.js";
import { ILoopContext } from "./types";

export class LoopContext implements ILoopContext {
  #bindingManager:IBindingManager;
  get bindingManager():IBindingManager {
    return this.#bindingManager;
  }

  get parentBindingManager():IBindingManager|undefined {
    return this.bindingManager.parentBinding?.bindingManager;
  }

  get binding():IBinding|undefined {
    return this.bindingManager.parentBinding;
  }

  get nearestBindingManager():IBindingManager|undefined {
    const prop = getPatternNameInfo(this.name); // ex. "list.*.detail.names.*"
    if (prop.level <= 0) return;
    const lastWildCardPath = prop.wildcardNames[prop.wildcardNames.length - 1]; // ex. "list.*.detail.names.*"
    const wildcardProp = getPatternNameInfo(lastWildCardPath); // ex. "list.*.detail.names.*"
    const parentProp = getPatternNameInfo(wildcardProp.parentPath); // ex. "list.*.detail.names"
    const searchName = parentProp.name; // ex. "list"
    let curBindingManager = this.parentBindingManager;
    while(typeof curBindingManager !== "undefined") {
      if (curBindingManager.loopContext.binding?.stateProperty.name === searchName) {
        return curBindingManager;
      }
      curBindingManager = curBindingManager.loopContext.parentBindingManager;
    }
  }

  get nearestLoopContext():ILoopContext|undefined {
    return this.nearestBindingManager?.loopContext;
  }

  #revision:number = -1;
  #index:number = -1;
  get _index():number {
    const revision = this.bindingManager.component.contextRevision;
    if (this.#revision !== revision) {
      this.#index = this.binding?.children.indexOf(this.#bindingManager) ?? -1;
      this.#revision = revision;
    }
    return this.#index;
  }

  get index():number {
    if (this.binding?.loopable) {
      return this._index;
    } else {
      // 上位のループコンテキストのインデックスを取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.index ?? -1;
    }
  }

  get name():string {
    if (this.binding?.loopable) {
      return this.binding.stateProperty.name;
    } else {
      // 上位のループコンテキストの名前を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.name ?? "";
    }
  }

  get indexes():number[] {
    if (this.binding?.loopable) {
      return this.nearestLoopContext?.indexes.concat(this.index) ?? [this.index];
    } else {
      // 上位のループコンテキストのインデクッス配列を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.indexes ?? [];
    }
  }

  get allIndexes():number[] {
    if (typeof this.binding === "undefined") return [];
    const index = (this.binding.loopable) ? this._index : -1;
    const indexes = this.parentBindingManager?.loopContext.allIndexes ?? [];
    return (index >= 0) ? indexes.concat(index) : indexes;
  }

  constructor(bindingManager:IBindingManager) {
    this.#bindingManager = bindingManager;
  }

  find(name:string):ILoopContext|undefined {
    let loopContext:ILoopContext|undefined = this;
    while(typeof loopContext !== "undefined") {
      if (loopContext.name === name) return loopContext;
      loopContext = loopContext.parentBindingManager?.loopContext;
    }
  }
}