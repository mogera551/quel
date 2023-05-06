import "../types.js";

export class Cache {
  #valueByIndexesStringByPropertyName = new Map;
  
  /**
   * 
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyName} propName 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(propName, indexes) {
    const valueByIndexesString = this.#valueByIndexesStringByPropertyName.get(propName);
    return valueByIndexesString ? valueByIndexesString.get(indexes.toString()) : undefined;
  }

  /**
   * 
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyName} propName 
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
   * 
   */
  clear() {
    this.#valueByIndexesStringByPropertyName.clear();
  }

}