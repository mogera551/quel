import "../types.js";

export class Context {

  /**
   * @returns {ContextInfo}
   */
  static create() {
    return {
      indexes: [],
      params: {},
    }
  }
  /**
   * 
   * @param {ContextInfo} src 
   */
  static clone(src) {
    /**
     * @type {ContextInfo}
     */
    const dst = {};
    dst.indexes = src.indexes.slice();
    dst.params = {};
    for(const [ name, stacks ] of Object.entries(src.params)) {
      dst.params[name] = [];
      for(const srcParam of stacks) {
        /**
         * @type {ContextParam}
         */
        const dstParam = {};
        dstParam.indexes = srcParam.indexes.slice();
        dstParam.pos = srcParam.pos;
        dstParam.propName = srcParam.propName;
        dst.params[name].push(dstParam);
      }
    }
    return dst;
  }
}