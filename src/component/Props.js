import "../types.js";
import { Symbols } from "../Symbols.js";

class Handler {
  #component;
  #buffer;
  #binds = [];

  /**
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  get component() {
    return this.#component;
  }

  get buffer() {
    return this.#buffer;
  }

  get binds() {
    return this.#binds;
  }

  /**
   * bind parent component's property
   * @param {string} prop 
   * @param {{name:string,indexes:number[]}|undefined} propAccess 
   */
  #bindProperty(prop, propAccess) {
    /**
     * return parent component's property getter function
     * @param {Handler} handler 
     * @param {string} name
     * @param {{name:string,indexes:number[]}} props 
     * @returns {()=>any}
     */
    const getFunc = (handler, name, props) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else if (handler.binds.length === 0) {
        return handler.component.getAttribute(`props:${name}`);
      } else {
        return handler.component.parentComponent.writableViewModel[Symbols.directlyGet](props.name, props.indexes);
      }
    };
    /**
     * return parent component's property setter function
     * @param {Handler} handler 
     * @param {string} name
     * @param {{name:string,indexes:number[]}} props 
     * @returns {(value:any)=>true}
     */
    const setFunc = (handler, name, props) => function (value) {
      if (typeof handler.buffer !== "undefined") {
        handler.buffer[name] = value;
        const changePropsEvent = new CustomEvent("changeprops");
        changePropsEvent.propName = name;
        changePropsEvent.propValue = value;
        handler.component.dispatchEvent(changePropsEvent);
      } else if (handler.binds.length === 0) {
        handler.component.setAttribute(`props:${name}`, value);
      } else {
        handler.component.parentComponent.writableViewModel[Symbols.directlySet](props.name, props.indexes, value);
      }
      return true;
    };
    // define component's property
    Object.defineProperty(this.#component.baseViewModel, prop, {
      get: getFunc(this, prop, propAccess),
      set: setFunc(this, prop, propAccess),
      configurable: true,
      enumerable: true,
    });
    if (typeof propAccess !== "undefined") {
      this.#binds.push({ prop, propAccess });
    }

  }

  #setBuffer(buffer) {
    this.#buffer = buffer;
    for(const key in buffer) {
      this.#bindProperty(key);
      this.#component.viewModel[Symbols.notifyForDependentProps](key, []);
    }
  }

  #getBuffer() {
    return this.#buffer;
  }

  #clearBuffer() {
    this.#buffer = undefined;
  }

  #createBuffer() {
    let buffer;
    buffer = this.#component.parentComponent.writableViewModel[Symbols.createBuffer](this.#component);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      buffer[prop] = this.#component.parentComponent.writableViewModel[Symbols.directlyGet](propAccess.name, propAccess.indexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const result = this.#component.parentComponent.writableViewModel[Symbols.flushBuffer](this.#buffer, this.#component);
      if (result !== true) {
        this.#binds.forEach(({ prop, propAccess }) => {
          this.#component.parentComponent.writableViewModel[Symbols.directlySet](propAccess.name, propAccess.indexes, this.#buffer[prop]);     
        });
      }
    }
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
    } else if (prop === Symbols.setBuffer) {
      return (buffer) => this.#setBuffer(buffer);
    } else if (prop === Symbols.getBuffer) {
      return () => this.#getBuffer();
    } else if (prop === Symbols.clearBuffer) {
      return () => this.#clearBuffer();
    } else if (prop === Symbols.createBuffer) {
      return () => this.#createBuffer();
    } else if (prop === Symbols.flushBuffer) {
      return () => this.#flushBuffer();
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

  /**
   * Proxy.ownKeys
   * @param {any} target
   * @param {Proxy<Handler>} receiver 
   * @returns {string[]}
   */
  ownKeys(target, receiver) {
    if (typeof this.buffer !== "undefined") {
      return Reflect.ownKeys(this.buffer);
    } else if (this.binds.length === 0) {
      return Array.from(this.component.attributes)
        .filter(attribute => attribute.name.startsWith("props:"))
        .map(attribute => attribute.name.slice(6));
    } else {
      return this.#binds.map(({ prop }) => prop);
    }
  }

  /**
   * Proxy.getOwnPropertyDescriptor
   * @param {any} target
   * @param {string} prop
   * @param {Proxy<Handler>} receiver
   * @returns {PropertyDescriptor}
   */
  getOwnPropertyDescriptor(target, prop, receiver) { // プロパティ毎に呼ばれます
    return {
      enumerable: true,
      configurable: true
      /* ...other flags, probable "value:..."" */
    };
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