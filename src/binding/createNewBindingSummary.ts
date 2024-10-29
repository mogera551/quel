import { getPatternInfo } from "../propertyInfo/getPatternInfo";
import { Index } from "../propertyInfo/types";
import { ILoopContext } from "../loopContext/types";
import { IStatePropertyAccessor } from "../state/types";
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
    loopIndexesIterator: IterableIterator<Index>,
    wildcardPaths:string[],
    index:number,
    resultBindings: IBinding[]
  ): void {
    if (index < wildcardPaths.length) {
      const wildcardPath = wildcardPaths[index];
      const wildcardPathInfo = getPatternInfo(wildcardPath);
      const wildcardIndex = loopIndexesIterator.next().value ?? utils.raise(`loopIndexes.at(${index}) is null`);
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
          loopIndexesIterator, 
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
    propertyAccessor: IStatePropertyAccessor
  ): IBinding[] {
    let bindings: IBinding[];
    if (typeof propertyAccessor.loopIndexes === "undefined" || propertyAccessor.loopIndexes.size === 0) {
      bindings = Array.from(this.noloopBindings[propertyAccessor.pattern] ?? []);
    } else {
      bindings = [];
      this._search(
        undefined, 
        propertyAccessor.pattern, 
        propertyAccessor.loopIndexes.forward(),
        propertyAccessor.patternInfo.wildcardPaths, 
        0, 
        bindings);
    }
    return bindings;
  }
}

export function createNewBindingSummary(): INewBindingSummary {
  return new NewBindingSummary();
}