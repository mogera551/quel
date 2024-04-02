import "../types.js";
import { Symbols } from "../Symbols.js";

class Handler {
  #component;
  #buffer;

  /**
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * bind parent component's property
   * @param {string} prop 
   * @param {{name:string,indexes:number[]}} propAccesss 
   */
  #bindProperty(prop, propAccesss) {
    /**
     * return parent component's property getter function
     * @param {Component} component 
     * @param {{name:string,indexes:number[]}} props 
     * @returns {()=>any}
     */
    const getFunc = (component, props) => function () { 
      return component.parentComponent.writableViewModel[Symbols.directlyGet](props.name, props.indexes);
    };
    /**
     * return parent component's property setter function
     * @param {Component} component 
     * @param {{name:string,indexes:number[]}} props 
     * @returns {(value:any)=>true}
     */
    const setFunc = (component, props) => function (value) { 
      component.parentComponent.writableViewModel[Symbols.directlySet](props.name, props.indexes, value);
      return true;
    };
    // define component's property
    Object.defineProperty(this.#component.baseViewModel, prop, {
      get: getFunc(this.#component, propAccesss),
      set: setFunc(this.#component, propAccesss),
      configurable: true,
    });

  }

  #setBuffer(buffer) {
    this.#buffer = buffer;
  }

  #getBuffer() {
    return this.#buffer;
  }

  #clearBuffer() {
    this.#buffer = undefined;
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
      return (prop, propAccess) => this.#bindProperty(prop, propAccess);
    }
    return this.#component.viewModel[prop];
  }

  /**
   * Proxy.set
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    this.#component.viewModel[prop] = value;
    return true;
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