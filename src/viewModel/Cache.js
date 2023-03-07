import PropertyInfo from "./PropertyInfo.js";

/**
 * キャッシュのキーは、プロパティとインデックス
 */

class CacheValue {
  /**
   * @type { boolean }
   */
  dirty = false;
  /**
   * @type { any }
   */
  value;

  /**
   * 
   * @param {any} value 
   */
  constructor(value) {
    this.value = value;

  }
}


export default class {
  /**
   * @type {Map<PropertyInfo,Map<string,CacheValue>>}
   */
  #valueByIndexesByProp = new Map();
  /**
   * @type {PropertyInfo[]}
   */
  #definedProperties
  /**
   * 
   * @param {PropertyInfo[]} definedProperties 
   */
  constructor(definedProperties) {
    this.#definedProperties = definedProperties;

  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(property, indexes) {
    const cacheValue = this.#valueByIndexesByProp.get(property)?.get(indexes.toString());
    return cacheValue ? (!cacheValue.dirty ? cacheValue.value : undefined) : undefined;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @param {any} value 
   */
  set(property, indexes, value) {
    let valueByIndexs = this.#valueByIndexesByProp.get(property);
    if (typeof valueByIndexs === "undefined") {
      valueByIndexs = new Map();
      this.#valueByIndexesByProp.set(property, valueByIndexs);
    }
    valueByIndexs.set(indexes.toString(), new CacheValue(value));
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {boolean}
   */
  has(property, indexes) {
    const cacheValue = this.#valueByIndexesByProp.get(property)?.get(indexes.toString());
    return cacheValue ? (!cacheValue.dirty) : false;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   */
  delete(property, indexes) {
    const indexesString = indexes.slice(0, property.loopLevel).toString();
    const indexesStarts = indexesString + ",";
    let valueByIndexes = this.#valueByIndexesByProp.get(property);
    if (valueByIndexes) {
      for(const indexes of valueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          valueByIndexes.get(indexes).dirty = true;
        }
      }
    }
    // 関連するキャッシュを取得し、削除する
    /**
     * 
     * @param {PropertyInfo} property 
     * @returns {PropertyInfo[]}
     */
    const getDependentProps = property => this.#definedProperties
        .filter(prop => !prop.isPrimitive && prop.parentName === property.name)
        .flatMap(prop => [prop].concat(getDependentProps(prop)));
    const dependentProps = getDependentProps(property);
    dependentProps.forEach(property => {
      const valueByIndexes = this.#valueByIndexesByProp.get(property);
      if (typeof valueByIndexes === "undefined") return;
      for(const indexes of valueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          valueByIndexes.get(indexes).dirty = true;;
        }
      }
    });


  }

  clear() {
    this.#valueByIndexesByProp.clear();
  }
}