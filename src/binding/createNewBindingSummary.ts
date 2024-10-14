import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { ILoopContext, ILoopIndexes } from "../loopContext/types";
import { utils } from "../utils";
import { IBinding, INewBindingSummary } from "./types";

class NewBindingSummary implements INewBindingSummary {
  allBindings = new Set<IBinding>();

  /**
   * ループコンテキストに紐づかないバインディングを登録する
   */
  noloopBindings: {[key: string]: Set<IBinding>} = {};

  rootLoopableBindings: {[key: string]: Set<IBinding>} = {};

  register(binding: IBinding) {
    const loopContext = binding.parentContentBindings?.currentLoopContext;

    this.allBindings.add(binding);
    if (binding.loopable) {
      if (typeof loopContext === "undefined") {
        this.rootLoopableBindings[binding.statePropertyName]?.add(binding) ??
        (this.rootLoopableBindings[binding.statePropertyName] = new Set([binding]));
      } else {
        loopContext.loopTreeLoopableNodesByName[binding.statePropertyName]?.add(binding) ??
          (loopContext.loopTreeLoopableNodesByName[binding.statePropertyName] = new Set([binding]));
      }
    }
    if (binding.stateProperty.propInfo.wildcardCount === 0) {
      this.noloopBindings[binding.statePropertyName]?.add(binding) ??
        (this.noloopBindings[binding.statePropertyName] = new Set([binding]));
    } else {
      if (!binding.parentContentBindings.localTreeNodes.has(binding)) {
        const parentLoopContext = loopContext?.namedLoopContexts[binding.stateProperty.lastWildCard] ?? 
          utils.raise("loopContext is undefined");
        parentLoopContext.loopTreeNodesByName[binding.statePropertyName]?.add(binding) ??
          (parentLoopContext.loopTreeNodesByName[binding.statePropertyName] = new Set([binding]));
      }
    }
  }

  delete(binding: IBinding) {
    const loopContext = binding.parentContentBindings?.currentLoopContext;

    this.allBindings.delete(binding);
    if (binding.loopable) {
      if (typeof loopContext === "undefined") {
        this.rootLoopableBindings[binding.statePropertyName]?.delete(binding);
      } else {
        loopContext.loopTreeLoopableNodesByName[binding.statePropertyName]?.delete(binding);
      }
    }
    if (binding.stateProperty.propInfo.wildcardCount === 0) {
      this.noloopBindings[binding.statePropertyName]?.delete(binding);
    } else {
      if (!binding.parentContentBindings.localTreeNodes.has(binding)) {
        const parentLoopContext = loopContext?.namedLoopContexts[binding.stateProperty.lastWildCard] ?? 
          utils.raise("loopContext is undefined");
        parentLoopContext.loopTreeNodesByName[binding.statePropertyName]?.delete(binding);
      }
    }
  }

  exists(binding: IBinding): boolean {
    return this.allBindings.has(binding);
  }

  _search(
    loopContext: ILoopContext | undefined, 
    searchPath: string,
    loopIndexes: ILoopIndexes, 
    wildcardPaths:string[],
    index:number,
    resultBindings: IBinding[]
  ): void {
    if (index < wildcardPaths.length) {
      const wildcardPath = wildcardPaths[index];
      const wildcardPathInfo = getPatternInfo(wildcardPath);
      const wildcardIndex = loopIndexes.at(index) ?? utils.raise(`loopIndexes.at(${index}) is null`);
      const wildcardParentPath = wildcardPathInfo.patternPaths.at(-2) ?? "";
      const loopBindings = typeof loopContext === "undefined" ? 
        Array.from(this.rootLoopableBindings[wildcardParentPath]) :
        Array.from(loopContext.loopTreeLoopableNodesByName[wildcardParentPath]);
      for(let i = 0; i < loopBindings.length; i++) {
        // リストが削除されている場合があるのでチェック
        if (typeof loopBindings[i].childrenContentBindings[wildcardIndex] === "undefined") continue;
        this._search(
          loopBindings[i].childrenContentBindings[wildcardIndex].loopContext, 
          searchPath, 
          loopIndexes, 
          wildcardPaths, 
          index + 1,
          resultBindings
        );
      }
    } else {
      (typeof loopContext !== "undefined") ? 
        resultBindings.push(...Array.from(loopContext.loopTreeNodesByName[searchPath] ?? [])) : [];
    }
  }

  gatherBindings(
    pattern: string, 
    loopIndexes: ILoopIndexes | undefined
  ): IBinding[] {
    let bindings: IBinding[];
    if (typeof loopIndexes === "undefined" || loopIndexes.size === 0) {
      bindings = Array.from(this.noloopBindings[pattern] ?? []);
    } else {
      bindings = [];
      const patternInfo = getPatternInfo(pattern);
      this._search(undefined, pattern, loopIndexes, patternInfo.wildcardPaths, 0, bindings);
    }
    return bindings;
  }
}

export function createNewBindingSummary(): INewBindingSummary {
  return new NewBindingSummary();
}