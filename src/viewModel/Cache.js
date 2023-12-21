import "../types.js";

export class Cache {
  /** @type {Map<PropertyName,Map<string,any>>} */
  #valueByIndexesStringByPropertyName = new Map;
  
  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(propName, indexes) {
    return this.#valueByIndexesStringByPropertyName.get(propName)?.get(indexes.toString()) ?? undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexes, value) {
    this.#valueByIndexesStringByPropertyName.get(propName)?.set(indexes.toString(), value) ?? 
      this.#valueByIndexesStringByPropertyName.set(propName, new Map([[indexes.toString(), value]]));
    return value;
  }

  /**
   * @returns {void}
   */
  clear() {
    this.#valueByIndexesStringByPropertyName.clear();
  }

}
