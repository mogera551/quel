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
   * @type {boolean}
   */
  updated;

  /**
   * 
   * @param {any} value 
   */
  constructor(value, updated) {
    this.value = value;
    this.updated = updated;
  }
}


export default class {
  /**
   * @type {Map<PropertyInfo,Map<string,CacheValue>>}
   */
  #cacheValueByIndexesByProp = new Map();
  /**
   * @type {PropertyInfo[]}
   */
  #definedProperties;
  /**
   * @type {Map<string,PropertyInfo[]>}
   */
  #definedPropertiesByParentName;

  /**
   * 
   * @param {PropertyInfo[]} definedProperties 
   */
  constructor(definedProperties) {
    this.#definedProperties = definedProperties;
    this.#definedPropertiesByParentName = definedProperties
    .filter(definedProperty => definedProperty.parentName !== "")
    .reduce((map, definedProperty) => {
      map.get(definedProperty.parentName)?.push(definedProperty) ??
      map.set(definedProperty.parentName, [ definedProperty ]);
      return map;
    }, new Map);

  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(property, indexes) {
    const cacheValue = this.#cacheValueByIndexesByProp.get(property)?.get(indexes.toString());
    return cacheValue ? (!cacheValue.dirty ? cacheValue.value : undefined) : undefined;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @param {any} value 
   * @param {boolean} updated
   */
  set(property, indexes, value, updated) {
    if (this.#definedPropertiesByParentName.has(property.name)) {
      this.delete(property, indexes);
    }
    let cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
    if (typeof cacheValueByIndexes === "undefined") {
      cacheValueByIndexes = new Map();
      this.#cacheValueByIndexesByProp.set(property, cacheValueByIndexes);
    }
    cacheValueByIndexes.set(indexes.toString(), new CacheValue(value, updated));
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {boolean}
   */
  has(property, indexes) {
    const cacheValue = this.#cacheValueByIndexesByProp.get(property)?.get(indexes.toString());
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
    let cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
    if (cacheValueByIndexes) {
      for(const indexes of cacheValueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          cacheValueByIndexes.get(indexes).dirty = true;
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
      const cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
      if (typeof cacheValueByIndexes === "undefined") return;
      for(const indexes of cacheValueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          cacheValueByIndexes.get(indexes).dirty = true;;
        }
      }
    });
  }

  clear() {
    this.#cacheValueByIndexesByProp.clear();
  }

  clearNoUpdated() {
    for(const [ key, cacheValueByIndexes ] of this.#cacheValueByIndexesByProp.entries()) {
      for(const [ indexes, cacheValue ] of cacheValueByIndexes.entries()) {
        if (!cacheValue.dirty && !cacheValue.updated) {
          cacheValue.dirty = true;
        }
      }
    }
  }
}