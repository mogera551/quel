import { IContentBindings, IContentBindingsBase } from "../newBinding/types";
import { utils } from "../utils";
import { INewLoopContext } from "./types";

export class LoopContext implements INewLoopContext{
  #contentBindings: IContentBindingsBase;
  #index?: number;
  #parentLoopContext?: INewLoopContext;
  #parentLoopCache = false;
  constructor(contentBindings: IContentBindingsBase) {
    contentBindings.parentBinding?.loopable === true || utils.raise("parentBinding is not loopable");
    this.#contentBindings = contentBindings;
  }

  get parentLoopContext(): INewLoopContext | undefined {
    if (!this.#parentLoopCache) {
      let curContentBindings:IContentBindingsBase | undefined = this.#contentBindings.parentBinding?.parentContentBindings;
      while (typeof curContentBindings !== "undefined") {
        if (typeof curContentBindings.loopContext !== "undefined" && curContentBindings.loopContext !== this) {
          break;
        }
        curContentBindings = curContentBindings.parentBinding?.parentContentBindings;
      }
      this.#parentLoopContext = curContentBindings?.loopContext;
      this.#parentLoopCache = true;
    }
    return this.#parentLoopContext;
  }

  get index(): number {
    if (typeof this.#index === "undefined") {
      this.#index = this.#contentBindings.parentBinding?.childrenContentBindings.indexOf(this.#contentBindings) ?? 
        utils.raise("parentBinding is undefined");
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

  clearIndex(): void {
    this.#parentLoopCache = false;
    this.#index = undefined;
  }
}