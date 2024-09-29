import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { ILoopContext } from "../loopContext/types";
import { IBinding, INewBindingSummary } from "./types";

class NewBindingSummary implements INewBindingSummary {
  allBindings = new Set<IBinding>();

  /**
   * ループコンテキストに紐づくバインディングを登録する
   */
  loopBindings = new Map<ILoopContext,Map<string,Set<IBinding>>>();

  /**
   * ループコンテキストに紐づくループ可能なバインディングを登録する
   */
  loopLinks = new Map<ILoopContext|undefined,Map<string,Set<IBinding>>>();

  /**
   * ループコンテキストに紐づかないバインディングを登録する
   */
  noloopBindings = new Map<string,Set<IBinding>>();

  registerLoopBinding(binding: IBinding, loopContext: ILoopContext) {
    const pattern = binding.statePropertyName;
    let store = this.loopBindings.get(loopContext);
    if (!store) {
      store = new Map();
      this.loopBindings.set(loopContext, store);
    }
    let bindings = store.get(pattern);
    if (!bindings) {
      bindings = new Set();
      store.set(pattern, bindings);
    }
    bindings.add(binding);
  }
  
  deleteLoopBinding(binding: IBinding, loopContext: ILoopContext) {
    const pattern = binding.statePropertyName;
    const store = this.loopBindings.get(loopContext);
    if (store) {
      const bindings = store.get(pattern);
      if (bindings) {
        bindings.delete(binding);
      }
    }
  }

  registerLoopLink(binding: IBinding) {
    const loopContext = binding.parentContentBindings?.currentLoopContext;
    let store = this.loopLinks.get(loopContext);
    if (typeof store === "undefined") {
      this.loopLinks.set(loopContext, store = new Map());
    }
    const pattern = binding.statePropertyName;
    let bindings = store.get(pattern);
    if (typeof bindings === "undefined") {
      store.set(pattern, bindings = new Set());
    }
    bindings.add(binding);
  }

  deleteLoopLink(binding: IBinding) {
    const loopContext = binding.parentContentBindings?.currentLoopContext;
    const pattern = binding.statePropertyName;
    const store = this.loopLinks.get(loopContext);
    if (store) {
      const bindings = store.get(pattern);
      if (bindings) {
        bindings.delete(binding);
      }
    }
  }

  regsiterNoloopBinding(binding: IBinding) {
    const pattern = binding.statePropertyName;
    let bindings = this.noloopBindings.get(pattern);
    if (typeof bindings === "undefined") {
      this.noloopBindings.set(pattern, bindings = new Set());
    }
    bindings.add(binding);
  }

  deleteNoloopBinding(binding: IBinding) {
    const pattern = binding.statePropertyName;
    const bindings = this.noloopBindings.get(pattern);
    if (bindings) {
      bindings.delete(binding);
    }
  }

  register(binding: IBinding) {
    this.allBindings.add(binding);
    if (binding.loopable) {
      this.registerLoopLink(binding);
    }
    const loopContext = binding.parentContentBindings?.currentLoopContext;
    if (typeof loopContext === "undefined") {
      this.regsiterNoloopBinding(binding);
    } else {
      this.registerLoopBinding(binding, loopContext);
    }
  }
  
  delete(binding: IBinding) {
    this.allBindings.delete(binding);
    if (binding.loopable) {
      this.deleteLoopLink(binding);
    }
    const loopContext = binding.parentContentBindings?.currentLoopContext;
    if (typeof loopContext === "undefined") {
      this.deleteNoloopBinding(binding);
    } else {
      this.deleteLoopBinding(binding, loopContext);
    }
  }

  getLoopBindings(loopContext: ILoopContext, pattern: string): IBinding[] {
    const store = this.loopBindings.get(loopContext);
    if (store) {
      const bindings = store.get(pattern);
      if (bindings) {
        return Array.from(bindings);
      }
    }
    return [];
  }

  exists(binding: IBinding): boolean {
    return this.allBindings.has(binding);
  }

  getLoopLink(loopContext: ILoopContext|undefined, pattern:string): IBinding[] {
    const store = this.loopLinks.get(loopContext);
    if (store) {
      const bindings = store.get(pattern);
      if (bindings) {
        return Array.from(bindings);
      }
    }
    return [];
  }

  getNoloopBindings(pattern: string): IBinding[] {
    const bindings = this.noloopBindings.get(pattern);
    if (bindings) {
      return Array.from(bindings);
    }
    return [];
  }

  _search(
    loopContext: ILoopContext | undefined, 
    searchPath: string,
    indexes: number[], 
    wildcardPaths:string[],
    index:number,
    resultBindings: IBinding[]
  ): void {
    if (index < wildcardPaths.length) {
      const wildcardPath = wildcardPaths[index];
      const wildcardPathInfo = getPatternInfo(wildcardPath);
      const wildcardIndex = indexes[index];
      const loopBindings = this.getLoopLink(loopContext, wildcardPathInfo.patternPaths.at(-2) ?? "");
      for(let i = 0; i < loopBindings.length; i++) {
        // リストが削除されている場合があるのでチェック
        if (typeof loopBindings[i].childrenContentBindings[wildcardIndex] === "undefined") continue;
        this._search(
          loopBindings[i].childrenContentBindings[wildcardIndex].loopContext, 
          searchPath, 
          indexes, 
          wildcardPaths, 
          index + 1,
          resultBindings
        );
      }
    } else {
      (typeof loopContext !== "undefined") ? resultBindings.push(...this.getLoopBindings(loopContext, searchPath)) : [];
    }
  }

  gatherBindings(
    pattern: string, 
    indexes: number[]
  ): IBinding[] {
    let bindings: IBinding[] = [];
    if (indexes.length === 0) {
      bindings = this.getNoloopBindings(pattern);
    } else {
      const patternInfo = getPatternInfo(pattern);
      this._search(undefined, pattern, indexes, patternInfo.wildcardPaths, 0, bindings);
    }
    return bindings;
  }
}

export function createNewBindingSummary(): INewBindingSummary {
  return new NewBindingSummary();
}