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
   * @type {Map<string,PropertyInfo[]>}
   */
  #dependentPropsByName;

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
    const getDependentProps = (properties, propertyName) => {
      (this.#definedPropertiesByParentName.get(propertyName) ?? []).forEach(definedProperty => {
        properties.push(definedProperty);
        getDependentProps(properties, definedProperty.name);
      });
      return properties;
    }
    this.#dependentPropsByName = 
      new Map(definedProperties.map(property => [ property.name, getDependentProps(new Array, property.name) ]));
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
   */
  set(property, indexes, value) {
    let cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
    if (typeof cacheValueByIndexes === "undefined") {
      cacheValueByIndexes = new Map();
      this.#cacheValueByIndexesByProp.set(property, cacheValueByIndexes);
    }
    cacheValueByIndexes.set(indexes.toString(), new CacheValue(value));
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
    const dependentProps = this.#dependentPropsByName.get(property.name) ?? []
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
}