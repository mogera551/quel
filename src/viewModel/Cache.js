import "../types.js";

export class Cache {
  /** @type {Map<PropertyName,Map<string,any>>} */
  #valueByIndexesStringByPropertyName = new Map;
  
  /**
   * 
   * @param {PropertyName} propName 
   * @param {string} indexesString 
   * @returns {any}
   */
  get(propName, indexesString) {
    return this.#valueByIndexesStringByPropertyName.get(propName)?.get(indexesString) ?? undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {string} indexesString 
   * @returns {boolean}
   */
  has(propName, indexesString) {
    return this.#valueByIndexesStringByPropertyName.get(propName)?.has(indexesString) ?? false;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {string} indexesString 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexesString, value) {
    this.#valueByIndexesStringByPropertyName.get(propName)?.set(indexesString, value) ?? 
      this.#valueByIndexesStringByPropertyName.set(propName, new Map([[indexesString, value]]));
    return value;
  }

  /**
   * @returns {void}
   */
  clear() {
    this.#valueByIndexesStringByPropertyName.clear();
  }

}
