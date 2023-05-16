import "../types.js";
import { Symbols } from "../Symbols.js";
import { GlobalData } from "../global/Data.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/**
 * @typedef {{prop:string,value:any}} GlobalDataAccessor
 */
/**
 * @type {ProxyHandler<typeof GlobalDataAccessor>}
 */
class Handler {
  /**
   * @type {import("./Component.js").Component}
   */
  #component;
  /**
   * @type {Set<string>}
   */
  setOfProps = new Set;

  /**
   * 
   * @param {import("./Component.js").Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * 
   * @param {string} prop 
   */
  bindProperty(prop) {
    GlobalData.data[Symbols.boundByComponent](this.#component, prop);
    this.setOfProps.add(prop);
  }

  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   * @returns {any}
   */
  directGet = (name, indexes) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[Symbols.directlyGet](name, indexes);
  }

  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   * @param {any} value 
   * @returns {boolean}
   */
  directSet = (name, indexes, value) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[Symbols.directlySet](name, indexes, value);
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.directlyGet) {
      return this.directGet;
    } else if (prop === Symbols.directlySet) {
      return this.directSet;
    } else if (prop === Symbols.isSupportDotNotation) {
      return true;
    }
    const { propName, indexes } = PropertyName.parse(prop);
    return this.directGet(propName.name, indexes);
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
    const { propName, indexes } = PropertyName.parse(prop);
    return this.directSet(propName.name, indexes, value);
  }
}

/**
 * 
 * @param {import("./Component.js").Component} component
 * @returns {Proxy<Handler>}
 */
export function createGlobals(component) {
  return new Proxy({}, new Handler(component));
}