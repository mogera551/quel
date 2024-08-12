import { LoopContext } from "../loopContext/LoopContext.js";
import "../types_.js";
import { utils } from "../utils.js";

/**
 * DirectlyCall時、context情報の復帰を行う
 */
export class DirectlyCallContext {
  /** @type {LoopContext} */
  #loopContext;
  get loopContext() {
    return this.#loopContext;
  }

  /**
   * 
   * @param {LoopContext} loopContext 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async callback(loopContext, directlyCallback) {
    if (typeof this.#loopContext !== "undefined") utils.raise("DirectlyCallContext: already set loopContext");
    this.#loopContext = loopContext;
    try {
      return await directlyCallback();
    } finally {
      this.#loopContext = undefined;
    }
  }

}