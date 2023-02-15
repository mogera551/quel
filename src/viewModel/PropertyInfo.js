export default class PropertyInfo {

  prop;
  elements;
  loopLevel;
  parent;
  lastElement;
  regexp;

  constructor(prop) {
    this.prop = prop;
    this.elements = prop.split(".");
    this.loopLevel = this.paths.reduce((count, element) => count + (element === "*") ? 1 : 0, 0);
    this.parent = this.elements.slice(0, -1).join(".");
    this.lastElement = this.elements.at(-1) ?? null;
    this.regexp = (this.loopLevel > 0) ? new RegExp("^" + prop.replaceAll("*", "(\\w+)").replaceAll(".", "\\.") + "$") : null;
  }

  /**
   * @type {Map<string,PropertyInfo>}
   */
  static #propertyInfoByProp = new Map;
  static create(prop) {
    let propertyInfo = this.#propertyInfoByProp.get(prop);
    if (typeof propertyInfo === "undefined") {
      propertyInfo = new PropertyInfo(prop);
      this.#propertyInfoByProp.set(prop, propertyInfo);
    }
    return propertyInfo;
  }
  
}