import { SYM_CALL_BIND_DATA, SYM_CALL_BIND_PROPERTY } from "../viewModel/Symbols.js";
import Component from "./Component.js";

function getPath(pattern, indexes) {
  let i = 0;
  return pattern.replaceAll("*", () => indexes[i++] ?? "*");
}
  
class Handler {
  /**
   * @type {{key:string,value:any}} 
   */
  #data = {};
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {Map<string,{bindProp:string,bindIndexes:number[]}>}
   */
  #bindPropByThisProp = new Map();

  /**
   * @type {{key:string,value:any}|ViewModel}
   */
  get data() {
    return (this.#component ? this.#component?.parentComponent?.viewModel : this.#data) ?? {};
  }

  /**
   * 
   * @param {{key:string,value:any}|Component} data 
   */
  [SYM_CALL_BIND_DATA](data) {
    if (data instanceof Component) {
      this.#component = data;
    } else {
      this.#data = data;
    }
  }

  /**
   * 
   * @param {string} thisProp 
   * @param {string} bindProp 
   * @param {number[]} bindIndexes 
   */
  [SYM_CALL_BIND_PROPERTY](thisProp, bindProp, bindIndexes) {
    this.#bindPropByThisProp.set(thisProp, { bindProp,  bindIndexes } );
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === SYM_CALL_BIND_DATA) {
      return (data) => Reflect.apply(this[SYM_CALL_BIND_DATA], this, [data]);
    }
    if (prop === SYM_CALL_BIND_PROPERTY) {
      return (thisProp, bindProp, bindIndexes) => Reflect.apply(this[SYM_CALL_BIND_PROPERTY], this, [thisProp, bindProp, bindIndexes]);
    }
    const { data } = this;
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, bindIndexes:[] };
    const bindPath = getPath(bindProp, bindIndexes);
    return Reflect.get(data, bindPath, data);
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
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, bindIndexes:[] };
    const bindPath = getPath(bindProp, bindIndexes);
    return Reflect.set(data, bindPath, value, data);
  }
}

/**
 * 
 * @returns {Proxy<Handler>}
 */
export default function createData() {
  return new Proxy({}, new Handler());
}