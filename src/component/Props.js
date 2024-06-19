import "../types.js";
import { Symbols } from "../Symbols.js";
import { PropertyName, RE_CONTEXT_INDEX } from "../../modules/dot-notation/dot-notation.js";

/**
 * @param {Component} component
 * @returns {number[]|undefined}
 */
const getPopoverContextIndexes = (component) => {
  const id = component.id;
  return component.parentComponent?.popoverContextIndexesById?.get(id);
}


/**
 * 
 * @param {Handler} handler 
 * @param {{name:string,indexes:number[]}} props 
 * @returns {number[]}
 */
const contextLoopIndexes = (handler, props) => {
  let indexes;
  const propName = new PropertyName(props.name);
  if (propName.level > 0 && props.indexes.length === 0 && handler.component.hasAttribute("popover")) {
    indexes = getPopoverContextIndexes(handler.component)?.slice(0 , propName.level);
  }
  return indexes ?? props.indexes;
}

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

  #saveBindProperties = {};

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
     * @param {import("../binding/nodeProperty/ComponentProperty.js").BindingPropertyAccess} props 
     * @returns {()=>any}
     */
    const getFunc = (handler, name, props) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else {
        const match = RE_CONTEXT_INDEX.exec(props.name);
        if (match) {
          const loopIndex = Number(match[1]) - 1;
          let indexes = props.loopContext.indexes;
          if (indexes.length === 0 && handler.component.hasAttribute("popover")) {
            indexes = getPopoverContextIndexes(handler.component) ?? [];
          }
          return indexes[loopIndex];
        } else {
          const loopIndexes = contextLoopIndexes(handler, props);
          return handler.component.parentComponent.readOnlyViewModel[Symbols.directlyGet](props.name, loopIndexes);
        }
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
      } else {
        const loopIndexes = contextLoopIndexes(handler, props);
        handler.component.parentComponent.writableViewModel[Symbols.directlySet](props.name, loopIndexes, value);
      }
      return true;
    };
    // save
    this.#saveBindProperties[prop] = Object.getOwnPropertyDescriptor(this.#component.baseViewModel, prop) ?? {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
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
    buffer = this.#component.parentComponent.readOnlyViewModel[Symbols.createBuffer](this.#component);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      const loopIndexes = contextLoopIndexes(this, propAccess);
      buffer[prop] = this.#component.parentComponent.readOnlyViewModel[Symbols.directlyGet](propAccess.name, loopIndexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const result = this.#component.parentComponent.writableViewModel[Symbols.flushBuffer](this.#buffer, this.#component);
      if (result !== true) {
        this.#binds.forEach(({ prop, propAccess }) => {
          const loopIndexes = contextLoopIndexes(this, propAccess);
          this.#component.parentComponent.writableViewModel[Symbols.directlySet](propAccess.name, loopIndexes, this.#buffer[prop]);     
        });
      }
    }
  }

  #clear() {
    this.#buffer = undefined;
    this.#binds = [];
    for(const [key, desc] of Object.entries(this.#saveBindProperties)) {
      Object.defineProperty(this.#component.baseViewModel, key, desc);
    }
    this.#saveBindProperties = {};
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
    } else if (prop === Symbols.clear) {
      return () => this.#clear();
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