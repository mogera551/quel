import "../types.js";

export class Context {

  /**
   * 空のコンテクスト情報を生成
   * @returns {ContextInfo}
   */
  static create() {
    return {
      indexes: [],
      stack: [],
    }
  }

  /**
   * コンテクスト情報をクローン
   * @param {ContextInfo} src 
   * @returns {ContextInfo}
   */
  static clone(src) {
    /**
     * @type {ContextInfo}
     */
    const dst = this.create();
    dst.indexes = src.indexes.slice();
    for(const srcParam of src.stack) {
      /**
       * @type {ContextParam}
       */
      const dstParam = {};
      dstParam.indexes = srcParam.indexes.slice();
      dstParam.pos = srcParam.pos;
      dstParam.propName = srcParam.propName;
      dst.stack.push(dstParam);
    }
    return dst;
  }
}