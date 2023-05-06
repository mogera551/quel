import "../types.js";
import  { utils } from "../utils.js";
import { Symbols } from "../viewModel/Symbols.js";
import { dotNotation } from "../../modules/imports.js";

/**
 * @typedef { {prop:string,value:any} } PropsAccessor
 */

/**
 * @type {ProxyHandler<typeof PropsAccessor>}
 */
class Handler {
  /**
   * @type {import("./Component.js").Component}
   */
  #component;
  /**
   * @type {Map<string,{bindProp:string,bindIndexes:number[]}>}
   */
  #bindPropByThisProp = new Map();

  /**
   * @type {Proxy<typeof ViewModel>}
   */
  #data = new Proxy({}, new dotNotation.Handler);

  /**
   * @type {{key:string,value:any}|ViewModel}
   */
  get data() {
    const data = this.#component?.parentComponent?.viewModel ?? this.#data;
//    (data[Symbols.isSupportDotNotation]) || utils.raise(`data is not support dot-notation`);
    return data;
  }

  /**
   * 
   * @param {import("./Component.js").Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.bindProperty) {
      return (thisProp, bindProp, bindIndexes) => 
        this.#bindPropByThisProp.set(thisProp, { bindProp,  bindIndexes } );
    }
    const { data } = this;
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
    if (bindProp) {
      return data[Symbols.directlyGet](bindProp, bindIndexes);
    } else {
      console.log(`undefined property ${prop}`);
      return undefined;
    }
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Prooxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { data } = this;
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
    if (bindProp) {
      return data[Symbols.directlySet](bindProp, bindIndexes, value);
    } else {
      console.log(`undefined property ${prop}`);
      return false;
    }
  }
}

/**
 * 
 * @type {import("./Component.js").Component} component
 * @returns {Proxy<Handler>}
 */
export function createProps(component) {
  return new Proxy({}, new Handler(component));
}