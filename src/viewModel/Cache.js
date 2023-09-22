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
    const valueByIndexesString = this.#valueByIndexesStringByPropertyName.get(propName);
    return valueByIndexesString ? valueByIndexesString.get(indexes.toString()) : undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexes, value) {
    let valueByIndexesString = this.#valueByIndexesStringByPropertyName.get(propName);
    if (!valueByIndexesString) {
      valueByIndexesString = new Map;
      this.#valueByIndexesStringByPropertyName.set(propName, valueByIndexesString);
    }
    valueByIndexesString.set(indexes.toString(), value);
    return value;
  }

  /**
   * @returns {void}
   */
  clear() {
    this.#valueByIndexesStringByPropertyName.clear();
  }

}
