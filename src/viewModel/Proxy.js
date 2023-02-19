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
import Cache from "./Cache.js";

const MAX_INDEXES_LEVEL = 8;
const CONTEXT_INDEXES = new Set(
  [...Array(MAX_INDEXES_LEVEL)].map((content,index) => `$${index + 1}`)   
);

class Handler {
  /**
   * @type {Cache}
   */
  cache = new Cache();
  /**
   * @type {Map<string,{indexes:integer[],propertyInfo:PropertyInfo}>}
   */
  propertyInfoIndexesByProp = new Map();
  /**
   * @type {integer[][]}
   */
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
   * @type {Map<string,string[]>}
   */
  dependentMap;
  /**
   * 
   * @param {Component} component 
   * @param {PropertyInfo[]} definedProperties
   * @param {Map<string,string[]>} dependentMap
   */
  constructor(component, definedProperties, dependentMap) {
    this.component = component;
    this.definedPropertyByProp = new Map(definedProperties.map(property => ([property.name, property])));
    this.loopProperties = definedProperties.filter(property => property.isLoop);
    this.dependentMap = dependentMap;
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

  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {Proxy<ViewModel>} receiver 
   */
  #getDefinedPropertyValue(target, prop, receiver) {
    const { lastIndexes, cache } = this;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    const cacheValue = cache.get(prop, indexes);
    if (typeof cacheValue !== "undefined") return cacheValue;
    const value = Reflect.get(target, prop.name, receiver);
    cache.set(prop, indexes, value);
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
    const { lastIndexes, cache } = this;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    Reflect.set(target, prop.name, value, receiver);
    cache.delete(prop, indexes);
    cache.set(prop, indexes, value);

    Thread.current.addNotify(new NotifyData(this.component, prop.name, lastIndexes));
    if (this.dependentMap.has(prop.name)) {
      const getDependentProps = (name) => 
        (this.dependentMap.get(name) ?? []).flatMap(name => [name].concat(getDependentProps(name)));
      const dependentProps = new Set(getDependentProps(prop.name));
      dependentProps.forEach(dependentProp => {
        const definedProperty = this.definedPropertyByProp.get(dependentProp);
        if (indexes.length < definedProperty.loopLevel) {
          const listOfIndexes = definedProperty.expand(receiver, indexes);
          listOfIndexes.forEach(depIndexes => {
            cache.delete(definedProperty, depIndexes);
            Thread.current.addNotify(new NotifyData(this.component, definedProperty.name, depIndexes));
          });
        } else {
          const depIndexes = indexes.slice(0, definedProperty.loopLevel);
          cache.delete(definedProperty, depIndexes);
          Thread.current.addNotify(new NotifyData(this.component, definedProperty.name, depIndexes));
        }
      });
    }

  this[SYM_CALL_WRITE](prop.name, lastIndexes, target, receiver);

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
    this.cache.clear();
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy<ViewModel>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    const lastIndexes = this.lastIndexes;
    if (typeof prop === "symbol") {
      switch(prop) {
        case SYM_GET_INDEXES:
          return lastIndexes;
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
      return lastIndexes[parseInt(prop.slice(1)) - 1];
    }

    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      // すでに、indexesはセットされている
      return this.#getDefinedPropertyValue(target, defindedProperty, receiver);
    } else {
      if (prop[0] !== "_") {
        let { loopProperty, indexes } = this.propertyInfoIndexesByProp.get(prop) ?? {};
        if (loopProperty == null) {
          let result;
          loopProperty = this.loopProperties.find(property => result = property.regexp.exec(prop));
          indexes = result.slice(1);
          this.propertyInfoIndexesByProp.set(prop, { loopProperty, indexes });
        }
        if (loopProperty && indexes) {
          return this[SYM_CALL_DIRECT_GET](loopProperty.name, indexes, target, receiver);
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
    } else {
      if (prop[0] !== "_") {
        let { loopProperty, indexes } = this.propertyInfoIndexesByProp.get(prop) ?? {};
        if (loopProperty == null) {
          let result;
          loopProperty = this.loopProperties.find(property => result = property.regexp.exec(prop));
          indexes = result.slice(1);
          this.propertyInfoIndexesByProp.set(prop, { loopProperty, indexes });
        }
        if (loopProperty && indexes) {
          this[SYM_CALL_DIRECT_SET](loopProperty.name, indexes, value, target, receiver);
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
  const { viewModel, definedProperties, dependentMap } = Accessor.convert(component, origViewModel);
  return new Proxy(viewModel, new Handler(component, definedProperties, dependentMap));

}