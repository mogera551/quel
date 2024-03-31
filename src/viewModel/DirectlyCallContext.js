import { NewLoopContext } from "../loopContext/NewLoopContext.js";
import "../types.js";
import { utils } from "../utils.js";

/**
 * DirectlyCall時、context情報の復帰を行う
 */
export class DirectlyCallContext {
  /** @type {LoopContext} */
  #newLoopContext;
  get newLoopContext() {
    return this.#newLoopContext;
  }

  /**
   * 
   * @param {NewLoopContext} newLoopContext 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async callback(newLoopContext, directlyCallback) {
    if (typeof this.#newLoopContext !== "undefined") utils.raise("DirectlyCallContext: already set newLoopContext");
    this.#newLoopContext = newLoopContext;
    try {
      return await directlyCallback();
    } finally {
      this.#newLoopContext = undefined;
    }
  }

}