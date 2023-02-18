import "../types.js";
import { 
  SYM_GET_INDEXES, SYM_GET_TARGET, 
  SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_CALL,
  SYM_CALL_INIT, SYM_CALL_WRITE, SYM_CALL_CLEAR_CACHE
} from "./Symbols.js";
import Component from "../component/Component.js";
import Accessor from "./Accessor.js";
import PropertyInfo from "./PropertyInfo.js";
import { ProcessData } from "../thread/Processor.js";
import Thread from "../thread/Thread.js";
import { NotifyData } from "../thread/Notifier.js";

const MAX_INDEXES_LEVEL = 8;
const CONTEXT_INDEXES = new Set(
  [...Array(MAX_INDEXES_LEVEL)].map((content,index) => `$${index + 1}`)   
);

class Handler {
  valueByPropertyKey = new Map();
  stackIndexes = [];
  /**
   * @type {Component}
   */
  component;
  /**
   * @type {Map<string,PropertyInfo>}
   */
  definedPropertyByProp = new Map;
  /**
   * @type {PropertyInfo[]}
   */
  loopProperties = [];

  /**
   * 
   * @param {Component} component 
   * @param {PropertyInfo[]} definedProperties
   */
  constructor(component, definedProperties) {
    this.component = component;
    this.definedPropertyByProp = new Map(definedProperties.map(property => ([property.name, property])));
    this.loopProperties = definedProperties.filter(property => property.isLoop);
  }

  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }

  async [SYM_CALL_INIT](target, receiver) {
    if (!("$oninit" in target)) return;
    return await Reflect.apply(target["$oninit"], receiver, []);
  }

  [SYM_CALL_WRITE](prop, indexes, target, receiver) {
    if ("$onwrite" in target) {
      const process = new ProcessData(target["$onwrite"], receiver, [ prop, indexes ]);
      Thread.current.addProcess(process);
      // await Reflect.apply(target["$onwrite"], receiver, [ prop, indexes ]);
    }
  }
/*
  #getPropertyValue(target, prop, receiver) {
    const indexes = this.lastIndexes;
    const key = `${prop}\t${indexes}`;
    if (this.valueByPropertyKey.has(key)) return this.valueByPropertyKey.get(key);

    const value = Reflect.get(target, prop, receiver);
    this.valueByPropertyKey.set(key, value);
    return value;
  }
*/
  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {Proxy<ViewModel>} receiver 
   */
  #getDefinedPropertyValue(target, prop, receiver) {
    const { lastIndexes, valueByPropertyKey } = this;
    const key = prop.isLoop ? `${prop.name}\t${lastIndexes.slice(0, prop.loopLevel)}` : prop.name;
    const cacheValue = valueByPropertyKey.get(key);
    if (typeof cacheValue !== "undefined") return cacheValue;
    const value = Reflect.get(target, prop.name, receiver);
    valueByPropertyKey.set(key, value);
    return value;
  }

  [SYM_CALL_DIRECT_GET](prop, indexes, target, receiver) {
    let value;
    this.stackIndexes.push(indexes);
    try {
      value = receiver[prop];
    } finally {
      this.stackIndexes.pop();
    }
    return value;
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
 #setDefinedPropertyValue(target, prop, value, receiver) {
  const { lastIndexes, valueByPropertyKey } = this;
  const key = prop.isLoop ? `${prop.name}\t${lastIndexes.slice(0, prop.loopLevel)}` : prop.name;
  Reflect.set(target, prop.name, value, receiver);
  valueByPropertyKey.set(key, value);
  return true;
}

  [SYM_CALL_DIRECT_SET](prop, indexes, value, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      receiver[prop] = value;
    } finally {
      this.stackIndexes.pop();
    }
    return true;
  }

  async [SYM_CALL_DIRECT_CALL](prop, indexes, event, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      await Reflect.apply(target[prop], receiver, [event, ...indexes]);
    } finally {
      this.stackIndexes.pop();
    }
  }

  [SYM_CALL_CLEAR_CACHE](target, receiver) {
    this.valueByPropertyKey.clear();
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy<ViewModel>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    const stackIndexes = this.stackIndexes;
    if (typeof prop === "symbol") {
      switch(prop) {
        case SYM_GET_INDEXES:
          return stackIndexes.at(-1);
        case SYM_GET_TARGET:
          return target;
        case SYM_CALL_DIRECT_GET:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_DIRECT_GET], this, [prop, indexes, target, receiver]);
        case SYM_CALL_DIRECT_SET:
          return (prop, indexes, value) => 
            Reflect.apply(this[SYM_CALL_DIRECT_SET], this, [prop, indexes, value, target, receiver]);
        case SYM_CALL_DIRECT_CALL:
          return (prop, indexes, event) => 
            Reflect.apply(this[SYM_CALL_DIRECT_CALL], this, [prop, indexes, event, target, receiver]);
        case SYM_CALL_INIT:
          return () => 
            Reflect.apply(this[SYM_CALL_INIT], this, [target, receiver]);
        case SYM_CALL_WRITE:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_WRITE], this, [prop, indexes, target, receiver]);
        case SYM_CALL_CLEAR_CACHE:
          return () => 
            Reflect.apply(this[SYM_CALL_CLEAR_CACHE], this, [target, receiver]);
      }
    }
    if (CONTEXT_INDEXES.has(prop)) {
      return this.lastIndexes[parseInt(prop.slice(1)) - 1];
    }

    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      // すでに、indexesはセットされている
      return this.#getDefinedPropertyValue(target, defindedProperty, receiver);
    } else {
      if (prop[0] !== "_") {
        let result;
        const loopProperty = this.loopProperties.find(property => result = property.regexp.exec(prop));
        if (loopProperty) {
          const prop = loopProperty.name;
          const indexes = result.slice(1);
          return this[SYM_CALL_DIRECT_GET](prop, indexes, target, receiver);
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
  set(target, prop, value, receiver) {
    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      return this.#setDefinedPropertyValue(target, defindedProperty, value, receiver);
//      return this.#setPropertyValue(target, prop, value, receiver);
//      this[SYM_CALL_DIRECT_SET](prop, [], value, target, receiver);
//      return true;
    } else {
      if (prop[0] !== "_") {
        let result;
        const loopProperty = this.loopProperties.find(property => result = property.regexp.exec(prop));
        if (loopProperty) {
          const prop = loopProperty.name;
          const indexes = result.slice(1);
          this[SYM_CALL_DIRECT_SET](prop, indexes, value, target, receiver);
          return true;
        }
      }
      Reflect.set(target, prop, value, receiver);
      return true;
    }
  }
}

/**
 * 
 * @param {Component} component
 * @param {ViewModel} origViewModel 
 * @returns {Proxy<ViewModel>}
 */
export default function create(component, origViewModel) {
  const { viewModel, definedProperties } = Accessor.convert(component, origViewModel);
  return new Proxy(viewModel, new Handler(component, definedProperties));

}