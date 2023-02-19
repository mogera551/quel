/**
 * キャッシュのキーは、プロパティとインデックス
 */

import PropertyInfo from "./PropertyInfo.js";

export default class {
  /**
   * @type {Map<PropertyInfo,Map<string,any>>}
   */
  valueByIndexesByProp = new Map();

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {integer[]} indexes 
   * @returns {any}
   */
  get(property, indexes) {
    return this.valueByIndexesByProp.get(property)?.get(indexes.toString());
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {integer[]} indexes 
   * @param {any} value 
   */
  set(property, indexes, value) {
    let valueByIndexs = this.valueByIndexesByProp.get(property);
    if (typeof valueByIndexs === "undefined") {
      valueByIndexs = new Map();
      this.valueByIndexesByProp.set(property, valueByIndexs);
    }
    valueByIndexs.set(indexes.toString(), value);
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {integer[]} indexes 
   * @returns {boolean}
   */
  has(property, indexes) {
    return this.valueByIndexesByProp.get(property)?.has(indexes.toString()) ?? false;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {integer[]} indexes 
   */
  delete(property, indexes) {
    const indexesString = indexes.toString();
    let valueByIndexes = this.valueByIndexesByProp.get(property);
    if (valueByIndexes) {
      valueByIndexes.delete(indexesString);
      if (valueByIndexes.size === 0) {
        this.valueByIndexesByProp.delete(property);
      }
    }
    // 関連するキャッシュを取得し、削除する
    const indexesStarts = indexesString + ",";
    const properties = Array.from(this.valueByIndexesByProp.keys());
    /**
     * 
     * @param {PropertyInfo} property 
     * @returns {PropertyInfo[]}
     */
    const getDependentProps = property => properties
        .filter(prop => !prop.isPrimitive && prop.parentName === property.name)
        .flatMap(prop => [prop].concat(getDependentProps(prop)));
    const dependentProps = getDependentProps(property);
    dependentProps.forEach(property => {
      const valueByIndexes = this.valueByIndexesByProp.get(property);
      for(const indexes of valueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          valueByIndexes.delete(indexes);
        }
      }
      if (valueByIndexes.size === 0) {
        this.valueByIndexesByProp.delete(property);
      }
    });


  }

  clear() {
    this.valueByIndexesByProp.clear();
  }
  


}