import { IContentBindingsBase, IBinding } from "../binding/types";
import { getPatternInfo } from "../dotNotation/PropInfo";
import { IPatternInfo } from "../dotNotation/types";
import { utils } from "../utils";
import { ILoopContext } from "./types";

export class LoopContext implements ILoopContext{
  #revision?: number;
  #contentBindings: IContentBindingsBase;
  #index?: number;
  #parentLoopContext?: ILoopContext;
  #parentLoopCache = false;
  #statePropertyName: string;
  #patternInfo: IPatternInfo;
  constructor(contentBindings: IContentBindingsBase) {
    contentBindings.parentBinding?.loopable === true || utils.raise("parentBinding is not loopable");
    this.#statePropertyName = contentBindings.parentBinding?.statePropertyName ?? utils.raise("statePropertyName is undefined");
    this.#contentBindings = contentBindings;
    this.#patternInfo = getPatternInfo(this.#statePropertyName + ".*");
  }

  get patternName(): string {
    return this.#patternInfo.wildcardPaths[this.#patternInfo.wildcardPaths.length - 1] ?? utils.raise("patternName is undefined");
  }
  get parentLoopContext(): ILoopContext | undefined {
    this.checkRevision();
    if (!this.#parentLoopCache) {
      const parentPattern = this.#patternInfo.wildcardPaths[this.#patternInfo.wildcardPaths.length - 2];
      let curContentBindings:IContentBindingsBase | undefined = undefined;
      if (typeof parentPattern !== "undefined") {
        curContentBindings = this.#contentBindings.parentBinding?.parentContentBindings;        
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
      this.#index = this.#contentBindings.parentBinding?.childrenContentBindings.indexOf(this.#contentBindings) ?? 
        utils.raise("parentBinding is undefined");
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
        this.#indexes = [...this.parentLoopContext.indexes, this.index];
      }
    }
    return this.#indexes;
  }

  checkRevision(): boolean {
    const revision = (this.#contentBindings.parentBinding as IBinding)?.nodeProperty.revisionForLoop;
    if (typeof this.#revision === "undefined" || this.#revision !== revision) {
      this.#index = undefined;
      this.#indexes = undefined;
      this.#parentLoopCache = true;
      this.#revision = revision;
      return true;
    }
    return false;
  }

  find(patternName: string): ILoopContext | undefined {
    let curContentBindings:IContentBindingsBase | undefined = this.#contentBindings;
    while (typeof curContentBindings !== "undefined") {
      if (typeof curContentBindings.loopContext !== "undefined" && curContentBindings.loopContext.patternName === patternName) {
        break;
      }
      curContentBindings = curContentBindings.parentBinding?.parentContentBindings;
    }
    return curContentBindings?.loopContext;
  }
}