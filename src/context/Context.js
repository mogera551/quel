import "../types.js";

/**
 * @type {ContextParam}
 */
export class ContextParam {
  /** @type {PropertyName} */
  #propName;
  get propName() {
    return this.#propName;
  }

  /** @type {number[]} */
  #indexes = [];
  get indexes() {
    return this.#indexes;
  }

  /** @type {number} */
  #pos;
  get pos() {
    return this.#pos;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {number} pos 
   */
  constructor(propName, indexes, pos) {
    this.#propName = propName;
    this.#indexes = indexes;
    this.#pos = pos;
  }
}

/**
 * @type {ContextInfo}
 */
export class ContextInfo {
  /** @type {number[]} */
  #indexes = [];
  get indexes() {
    return this.#indexes;
  }

  /** @type {ContextParam[]} */
  #stack = [];
  get stack() {
    return this.#stack;
  }

  /**
   * 
   * @param {ContextInfo} src 
   */
  copy(src) {
    this.#indexes = src.indexes.slice();
    this.#stack = src.stack.slice();
  }

}

export class Context {

  /**
   * 空のコンテクスト情報を生成
   * @returns {ContextInfo}
   */
  static create() {
    return new ContextInfo;
  }

  /**
   * コンテクスト情報をクローン
   * @param {ContextInfo} src 
   * @returns {ContextInfo}
   */
  static clone(src) {
    const contextInfo = new ContextInfo;
    contextInfo.copy(src);
    return contextInfo;
  }
}