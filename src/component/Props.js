import "../types.js";
import { Symbols } from "../Symbols.js";
import { Handler as DotNotationHandler } from "../../modules/dot-notation/dot-notation.js";

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
  #data = new Proxy({}, new DotNotationHandler);

  get hasParent() {
    return this.#component?.parentComponent?.viewModel != null;
  }
  /**
   * @type {{key:string,value:any}|ViewModel}
   */
  get data() {
    const data = this.hasParent ? this.#component.parentComponent.viewModel : this.#data;
//    (data[Symbols.isSupportDotNotation]) || utils.raise(`data is not support dot-notation`);
    return data;
  }
  /**
   * 
   */
  get object() {
    const retObject = {};
    if (this.hasParent) {
      const viewModel = this.#component.parentComponent.viewModel;
      for(const [key, bindAccess] of this.#bindPropByThisProp.entries()) {
        const { bindProp, bindIndexes } = bindAccess;
        retObject[key] = viewModel[Symbols.directlyGet](bindProp, bindIndexes);;
      }
    } else {
      for(const [key, value] of Object.entries(this.#data)) {
        retObject[key] = value;
      }
    }
    return retObject;
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
    } else if (prop === Symbols.toObject) {
      return () => this.object;
    }
    const { data } = this;
    if (this.hasParent) {
      const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (bindProp) {
        return data[Symbols.directlyGet](bindProp, bindIndexes);
      } else {
        console.error(`undefined property ${prop}`);
        return undefined;
      }
    } else {
      return Reflect.get(data, prop);
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
    if (this.hasParent) {
      const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (bindProp) {
        return data[Symbols.directlySet](bindProp, bindIndexes, value);
      } else {
        console.error(`undefined property ${prop}`);
        return false;
      }
    } else {
      return Reflect.set(data, prop, value);
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