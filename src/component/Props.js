import "../types.js";
import { Symbols } from "../Symbols.js";
import { Handler as DotNotationHandler } from "../../modules/dot-notation/dot-notation.js";

/**
 * @typedef { {prop:string,value:any} } PropsAccessor
 */

/**
 * @type {ProxyHandler<PropsAccessor>}
 */
class Handler {
  /** @type {Component} */
  #component;

  /** @type {Map<string,{name:string,indexes:number[]}>} */
  #bindPropByThisProp = new Map();

  /** @type {Proxy<typeof ViewModel>} */
  #data = new Proxy({}, new DotNotationHandler);

  /** @type {boolean} */
  get hasParent() {
    return this.#component?.parentComponent?.viewModel != null;
  }

  /** @type {{key:string,value:any}|ViewModel} */
  get data() {
    const data = this.hasParent ? this.#component.parentComponent.viewModel : this.#data;
//    (data[Symbols.isSupportDotNotation]) || utils.raise(`data is not support dot-notation`);
    return data;
  }
  /** @type {Object<string,any>} */
  get object() {
    const retObject = {};
    if (this.hasParent) {
      const viewModel = this.#component.parentComponent.viewModel;
      for(const [key, bindAccess] of this.#bindPropByThisProp.entries()) {
        const { name, indexes } = bindAccess;
        retObject[key] = viewModel[Symbols.directlyGet](name, indexes);;
      }
    } else {
      for(const [key, value] of Object.entries(this.#data)) {
        retObject[key] = value;
      }
    }
    return retObject;
  }

  /** 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * Proxy.get
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.bindProperty) {
      return ((object) => (thisProp, propAccess) => {
        this.#bindPropByThisProp.set(thisProp, propAccess );
        if (typeof this.#component.viewModel !== "undefined") {
          Object.defineProperty(this.#component.viewModel, thisProp, {
            get: ((prop) => function () { return object[prop]; })(thisProp),
            set: ((prop) => function (value) { object[prop] = value; })(thisProp),
            configurable: true,
          });
  
        }
    
      })(receiver);
    } else if (prop === Symbols.toObject) {
      return () => this.object;
    }
    const { data } = this;
    if (this.hasParent) {
      const { name, indexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (name) {
        return data[Symbols.directlyGet](name, indexes);
      } else {
        console.error(`undefined property ${prop}`);
        return undefined;
      }
    } else {
      return Reflect.get(data, prop);
    }
  }

  /**
   * Proxy.set
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Prooxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { data } = this;
    if (this.hasParent) {
      const { name, indexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (name) {
        return data[Symbols.directlySet](name, indexes, value);
      } else {
        console.error(`undefined property ${prop}`);
        return false;
      }
    } else {
      if (typeof data[prop] === "undefined") {
        receiver[Symbols.bindProperty](prop, { name: prop, indexes: [] });
      }
      const retValue = Reflect.set(data, prop, value);
      this.#component.viewModel?.[Symbols.writeCallback](`$props.${prop}`, []);
      this.#component.viewModel?.[Symbols.notifyForDependentProps](`${prop}`, []);
      return retValue;
    }
  }
}

/**
 * 
 * @param {Component} component
 * @returns {Proxy<Handler>}
 */
export function createProps(component) {
  return new Proxy({}, new Handler(component));
}