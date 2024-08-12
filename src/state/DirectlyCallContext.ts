import { utils } from "../utils";
import { ILoopContext } from "../@types/loopContext.js";
import { IDirectlyCallContext } from "../@types/state.js";

/**
 * DirectlyCall時、context情報の復帰を行う
 */
export class DirectlyCallContext implements IDirectlyCallContext {
  #loopContext:ILoopContext|undefined;
  get loopContext():ILoopContext {
    return this.#loopContext ?? utils.raise("DirectlyCallContext: loopContext is not set");
  }

  async callback(loopContext:ILoopContext, directlyCallback:()=>Promise<void>):Promise<void> {
    if (typeof this.#loopContext !== "undefined") utils.raise("DirectlyCallContext: already set loopContext");
    this.#loopContext = loopContext;
    try {
      return await directlyCallback();
    } finally {
      this.#loopContext = undefined;
    }
  }

}