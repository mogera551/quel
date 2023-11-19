import "../types.js";
import { utils } from "../utils.js";

/**
 * DirectlyCall時、context情報の復帰を行う
 */
export class DirectlyCallContext {
  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }

  /**
   * 
   * @param {ContextInfo} context 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async callback(context, directlyCallback) {
    if (typeof this.#context !== "undefined") utils.raise("already set context");
    this.#context = context;
    try {
      return await directlyCallback();
    } finally {
      this.#context = undefined;
    }
  }

}