import Component from "../component/Component.js";
import { SYM_GET_INDEXES, SYM_GET_TARGET } from "./Symbols.js";

export default class PropertyInfo {

  name;
  elements;
  loopLevel;
  parentProp;
  lastElement;
  regexp;

  constructor(name) {
    this.name = name;
    this.elements = name.split(".");
    this.loopLevel = this.elements.reduce((count, element) => count + (element === "*") ? 1 : 0, 0);
    this.parentName = this.elements.slice(0, -1).join(".");
    this.lastElement = this.elements.at(-1) ?? null;
    this.regexp = (this.loopLevel > 0) ? new RegExp("^" + name.replaceAll("*", "(\\w+)").replaceAll(".", "\\.") + "$") : null;
    this.isPrimitive = this.elements.length === 1 && this.loopLevel === 0;
    this.privateName = this.isPrimitive ? `_${name}` : null;
    this.isObject = this.elements.length > 1 && this.loopLevel === 0;
    this.isLoop = this.elements.length > 1 && this.loopLevel > 0;
    this.isNotPrimitive = ! this.isPrimitive ;
  }

  /**
   * 
   * @param {Component} component 
   * @returns 
   */
  primitiveGetter(component) {
    return component.viewModel[this.privateName];
  }
  /**
   * 
   * @param {Component} component 
   * @param {any} value 
   * @returns 
   */
  primitiveSetter(component, value) {
    component.viewModel[this.privateName] = value;
    return true;
  }
  /**
   * 
   * @param {Component} component 
   * @returns 
   */
  nonPrimitiveGetter(component) {
    const { parentName, loopLevel, lastElement } = this;
    const viewModel = component.viewModel;
    const index = (lastElement === "*") ? viewModel[SYM_GET_INDEXES][loopLevel - 1] : lastElement;
    return viewModel[parentName][index];
  }
  /**
   * 
   * @param {Component} component 
   * @param {any} value 
   * @returns 
   */
  nonPrimitiveSetter(component, value) {
    const { parentName, loopLevel, lastElement } = this;
    const viewModel = component.viewModel;
    const index = (lastElement === "*") ? viewModel[SYM_GET_INDEXES][loopLevel - 1] : lastElement;
    viewModel[parentName][index] = value;
    return true;
  }
  /**
   * 
   * @param {Component} component 
   * @returns {PropertyDescriptor}
   */
  createPropertyDescriptor(component) {
    return {
      get : this.isPrimitive ?
        () => Reflect.apply(this.primitiveGetter, this, [component]) : 
        () => Reflect.apply(this.nonPrimitiveGetter, this, [component]),
      set : this.isPrimitive ?
        value => Reflect.apply(this.primitiveSetter, this, [component, value]) : 
        value => Reflect.apply(this.nonPrimitiveSetter, this, [component, value]),
      enumerable: true, 
      configurable: true,
    }
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