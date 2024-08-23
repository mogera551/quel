import { IContentBindings } from "../newBinding/types";
import { utils } from "../utils";
import { INewLoopContext } from "./types";

export class LoopContext implements INewLoopContext{
  #contentBindings: IContentBindings;
  #index?: number;
  constructor(contentBindings: IContentBindings) {
    this.#contentBindings = contentBindings;
  }

  get parentLoopContext(): INewLoopContext | undefined {
    let contentBindings:IContentBindings | undefined = this.#contentBindings.parentContentBindings;
    while (typeof contentBindings !== "undefined") {
      if (contentBindings.loopContext !== this) {
        return contentBindings.loopContext;
      }
    }
    return undefined; // 仮実装
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
    this.#index = undefined;
  }
}