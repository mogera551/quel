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

  #bindPropByThisProp = new Map();

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

  [SYM_CALL_BIND_PROPERTY](thisProp, bindProp, indexes) {
    this.#bindPropByThisProp.set(thisProp, { bindProp,  indexes } );
  }

  get(target, prop, receiver) {
    if (prop === SYM_CALL_BIND_DATA) {
      return (data) => Reflect.apply(this[SYM_CALL_BIND_DATA], this, [data]);
    }
    if (prop === SYM_CALL_BIND_PROPERTY) {
      return (thisProp, bindProp, indexes) => Reflect.apply(this[SYM_CALL_BIND_PROPERTY], this, [thisProp, bindProp, indexes]);
    }
    const { data } = this;
    const { bindProp, indexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, indexes:[] };
    const bindPath = getPath(bindProp, indexes);
    return Reflect.get(data, bindPath, data);
  }

  set(target, prop, value, receiver) {
    const { data } = this;
    const { bindProp, indexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, indexes:[] };
    const bindPath = getPath(bindProp, indexes);
    return Reflect.set(data, bindPath, value, data);
  }
}

/**
 * 
 * @param {Component} component 
 * @returns 
 */
export default function createData(component) {
  return new Proxy({}, new Handler(component));
}