import { IBinding, IBindingTreeNode, IContentBindingsTreeNode } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { IPatternInfo } from "../dotNotation/types";
import { utils } from "../utils";
import { ILoopContext } from "./types";

class LoopContext implements ILoopContext{
  #revision?: number;
  #contentBindings: IContentBindingsTreeNode;
  #index?: number;
  #parentLoopContext?: ILoopContext;
  #parentLoopCache = false;
  #statePropertyName: string;
  #patternInfo: IPatternInfo;
  #patternName: string;
  #parentBinding: IBindingTreeNode;
  constructor(
    contentBindings: IContentBindingsTreeNode
  ) {
    this.#parentBinding = contentBindings.parentBinding ?? utils.raise("parentBinding is undefined");
    (this.#parentBinding.loopable === false) && utils.raise("parentBinding is not loopable");
    this.#statePropertyName = this.#parentBinding.statePropertyName ?? utils.raise("statePropertyName is undefined");
    this.#contentBindings = contentBindings;
    this.#patternInfo = getPatternInfo(this.#statePropertyName + ".*");
    this.#patternName = this.#patternInfo.wildcardPaths[this.#patternInfo.wildcardPaths.length - 1] ?? utils.raise("patternName is undefined");
  }

  get parentBinding(): IBindingTreeNode {
    return this.#parentBinding;
  }
  get contentBindings(): IContentBindingsTreeNode {
    return this.#contentBindings;
  }

  get patternName(): string {
    return this.#patternName;
  }
  get parentLoopContext(): ILoopContext | undefined {
    // インデックスは変わるが親子関係は変わらないので、checkRevisionは不要
    if (!this.#parentLoopCache) {
      const parentPattern = this.#patternInfo.wildcardPaths[this.#patternInfo.wildcardPaths.length - 2];
      let curContentBindings:IContentBindingsTreeNode | undefined = undefined;
      if (typeof parentPattern !== "undefined") {
        curContentBindings = this.#parentBinding.parentContentBindings;        
        while (typeof curContentBindings !== "undefined") {
          if (typeof curContentBindings.loopContext !== "undefined" && curContentBindings.loopContext.patternName === parentPattern) {
            break;
          }
          curContentBindings = curContentBindings.parentBinding?.parentContentBindings;
        }
        if (typeof curContentBindings === "undefined") {
          utils.raise("parentLoopContext is undefined");
        }
      }
      this.#parentLoopContext = curContentBindings?.loopContext;
      this.#parentLoopCache = true;
    }
    return this.#parentLoopContext;
  }

  get index(): number {
    this.checkRevision();
    if (typeof this.#index === "undefined") {
      this.#index = this.#parentBinding.childrenContentBindings.indexOf(this.#contentBindings);
    }
    return this.#index;
  }

  #indexes?: number[];
  get indexes(): number[] {
    this.checkRevision();
    if (typeof this.#indexes === "undefined") {
      if (typeof this.parentLoopContext === "undefined") {
        this.#indexes = [this.index];
      } else {
        this.#indexes = this.parentLoopContext.indexes.concat(this.index);
      }
    }
    return this.#indexes;
  }

  checkRevision(): boolean {
    const revision = (this.#contentBindings.parentBinding as IBinding)?.nodeProperty.revisionForLoop;
    if (typeof this.#revision === "undefined" || this.#revision !== revision) {
      this.#index = undefined;
      this.#indexes = undefined;
      this.#parentLoopCache = false;
      this.#revision = revision;
      return true;
    }
    return false;
  }

  find(patternName: string): ILoopContext | undefined {
    let curContentBindings:IContentBindingsTreeNode | undefined = this.#contentBindings;
    while (typeof curContentBindings !== "undefined") {
      if (typeof curContentBindings.loopContext !== "undefined" && curContentBindings.loopContext.patternName === patternName) {
        break;
      }
      curContentBindings = curContentBindings.parentBinding?.parentContentBindings;
    }
    return curContentBindings?.loopContext;
  }

  dispose(): void {
  }
}

export function createLoopContext(contentBindings: IContentBindingsTreeNode): ILoopContext {
  return new LoopContext(contentBindings);
}