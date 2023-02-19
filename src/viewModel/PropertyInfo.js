import Component from "../component/Component.js";
import { SYM_CALL_DIRECT_GET, SYM_GET_INDEXES, SYM_GET_TARGET } from "./Symbols.js";
import "../types.js";

export default class PropertyInfo {

  name;
  elements;
  loopLevel;
  parentName;
  lastElement;
  regexp;
  isPrimitive;
  privateName;
  isObject;
  isLoop;
  isNotPrimitive;

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
   * @param {ViewModel} viewModel 
   * @returns 
   */
  primitiveGetter(viewModel) {
    return viewModel[this.privateName];
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {any} value 
   * @returns 
   */
  primitiveSetter(viewModel, value) {
    viewModel[this.privateName] = value;
    return true;
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @returns 
   */
  nonPrimitiveGetter(viewModel) {
    const { parentName, loopLevel, lastElement } = this;
    const index = (lastElement === "*") ? viewModel[SYM_GET_INDEXES][loopLevel - 1] : lastElement;
    return viewModel[parentName][index];
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {any} value 
   * @returns 
   */
  nonPrimitiveSetter(viewModel, value) {
    const { parentName, loopLevel, lastElement } = this;
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
        () => Reflect.apply(this.primitiveGetter, this, [component.viewModel]) : 
        () => Reflect.apply(this.nonPrimitiveGetter, this, [component.viewModel]),
      set : this.isPrimitive ?
        value => Reflect.apply(this.primitiveSetter, this, [component.viewModel, value]) : 
        value => Reflect.apply(this.nonPrimitiveSetter, this, [component.viewModel, value]),
      enumerable: true, 
      configurable: true,
    }
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {integer[]} indexes 
   * @returns {integer[][]}
   */
  expand(viewModel, indexes) {
    if (this.loopLevel === indexes.length) {
      return [{ propertyInfo:this, indexes }];
    } else if (this.loopLevel < indexes.length) {
      return [{ propertyInfo:this, indexes:indexes.slice(0, this.loopLevel) }];
    } else {
      const traverse = (parentElements, elementIndex, loopIndexes) => {
        const element = this.elements[elementIndex];
        const isTerminate = (this.elements.length - 1) === elementIndex;
        if (element === "*") {
          if (loopIndexes.length < indexes.length) {
            return isTerminate ? [ indexes.slice(0, loopIndexes.length + 1) ] :
              traverse(parentElements.concat(element), elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
          } else {
            const parentProperty = parentElements.join(".");
            const keys = Array.from(Object.keys(viewModel[SYM_CALL_DIRECT_GET](parentProperty, loopIndexes) ?? []));
            return keys.map(key => {
              return isTerminate ? [ loopIndexes.concat(key) ] :
                traverse(parentElements.concat(element), elementIndex + 1, loopIndexes.concat(key));
            })
          }
        } else {
          return isTerminate ? [ loopIndexes ] : 
           traverse(parentElements.concat(element), elementIndex + 1, loopIndexes);
        }

      };
      const listOfIndexes = traverse([], 0, []);
      //console.log(listOfIndexes);
      return listOfIndexes;

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