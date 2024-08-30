import { IContentBindingsBase, ILoopable, INewBinding } from "../binding/types";
import { getPatternInfo } from "../newDotNotation/PropInfo";
import { IPatternInfo } from "../newDotNotation/types";
import { utils } from "../utils";
import { INewLoopContext } from "./types";

export class LoopContext implements INewLoopContext{
  #revision?: number;
  #contentBindings: IContentBindingsBase;
  #index?: number;
  #parentLoopContext?: INewLoopContext;
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
    return this.#patternInfo.wildcardPaths.at(-1) ?? utils.raise("patternName is undefined");
  }
  get parentLoopContext(): INewLoopContext | undefined {
    if (!this.#parentLoopCache) {
      const parentPattern = this.#patternInfo.wildcardPaths.at(-2);
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
    // todo: unknownをなんとかする
    const revision = ((this.#contentBindings.parentBinding as INewBinding)?.nodeProperty as unknown as ILoopable).revision;
    if (typeof this.#index === "undefined" || this.#revision !== revision) {
      this.#index = this.#contentBindings.parentBinding?.childrenContentBindings.indexOf(this.#contentBindings) ?? 
        utils.raise("parentBinding is undefined");
      this.#parentLoopCache = false;
      this.#revision = revision;
    }
    return this.#index;
  }

  // ToDo:キャッシュが効くか検討する
  get indexes(): number[] {
    if (typeof this.parentLoopContext === "undefined") {
      return [this.index];
    } else {
      return [...this.parentLoopContext.indexes, this.index];
    }
  }

  find(patternName: string): INewLoopContext | undefined {
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