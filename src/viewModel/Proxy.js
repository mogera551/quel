import "../types.js";
import main from "../main.js";
import { 
  SYM_GET_INDEXES, SYM_GET_TARGET, SYM_GET_DEPENDENT_MAP,
  SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_CALL,
  SYM_CALL_INIT, SYM_CALL_WRITE, SYM_CALL_CLEAR_CACHE, SYM_GET_RAW, SYM_GET_IS_PROXY, 
  SYM_CALL_CONNECT, SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS, SYM_CALL_BIND_DATA
} from "./Symbols.js";
import Component from "../component/Component.js";
import Accessor from "./Accessor.js";
import PropertyInfo from "./PropertyInfo.js";
import { ProcessData } from "../thread/Processor.js";
import { NotifyData } from "../thread/Notifier.js";
import Cache from "./Cache.js";
import createArrayProxy from "./ArrayProxy.js";
import Globals from "./Globals.js";

const MAX_INDEXES_LEVEL = 8;
const CONTEXT_INDEXES = [...Array(MAX_INDEXES_LEVEL)].map((content,index) => "$" + (index + 1));
const SET_OF_CONTEXT_INDEXES = new Set(CONTEXT_INDEXES);
const CONTEXT_COMPONENT = "$component";
const CONTEXT_DATA = "$data";
const CONTEXT_OPEN_DIALOG = "$openDialog";
const CONTEXT_CLOSE_DIALOG = "$closeDialog";
const CONTEXT_NOTIFY = "$notify";
const CONTEXT_GLOBALS = "$globals";
const CONTEXT_PARAMS = [CONTEXT_COMPONENT, CONTEXT_DATA, CONTEXT_OPEN_DIALOG, CONTEXT_CLOSE_DIALOG, CONTEXT_NOTIFY, CONTEXT_GLOBALS];
const SET_OF_CONTEXT_ALL_PARAMS = new Set(CONTEXT_INDEXES.concat(CONTEXT_PARAMS));

/**
 * 配列プロキシを取得
 * 配列プロキシのプロキシといった重複をさけるため、
 * いったん元の配列を求めてからプロキシにする
 * @param {Component} component 
 * @param {PropertyInfo} prop 
 * @param {number[]} indexes
 * @param {any} value 
 * @returns 
 */
const wrapArray = (component, prop, indexes, value) => {
  value = value?.[SYM_GET_IS_PROXY] ? value[SYM_GET_RAW] : value;
  return (value instanceof Array) ? createArrayProxy(value, component, prop, indexes) : value;
}

class Handler {
  /**
   * @type {Cache}
   */
  cache;
  /**
   * @type {Map<string,{indexes:number[],propertyInfo:PropertyInfo}>}
   */
  propertyInfoAndIndexesByProp = new Map();
  /**
   * @type {number[][]}
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
   * @type {Map<string,Set<string>>}
   */
  setOfDependentPropNamesByPropName = new Map;
  /**
   * @type {string[]}
   */
  cachablePropertyNames = [];
  setOfCachablePropertyNames = new Set;
  /**
   * 
   */
  globals;
  /**
   * 
   * @param {Component} component 
   * @param {PropertyInfo[]} definedProperties
   * @param {Map<string,string[]>} dependentMap
   * @param {string[]} cachablePropertyNames
   */
  constructor(component, definedProperties, dependentMap, cachablePropertyNames) {
    this.component = component;
    this.definedPropertyByProp = new Map(definedProperties.map(property => ([property.name, property])));
    this.loopProperties = definedProperties.filter(property => property.isLoop);
    this.dependentMap = dependentMap;
    this.cachablePropertyNames = cachablePropertyNames;
    this.setOfCachablePropertyNames = new Set(cachablePropertyNames);
    this.cache = new Cache(definedProperties);
    const getDependentProps = (setOfPropertyNames, propertyName) => {
      (dependentMap.get(propertyName) ?? []).forEach(refPropertyName => {
        if (!setOfPropertyNames.has(refPropertyName)) {
          setOfPropertyNames.add(refPropertyName);
          getDependentProps(setOfPropertyNames, refPropertyName);
        }
      });
      return setOfPropertyNames;
    };
    this.setOfDependentPropNamesByPropName = 
      new Map(Array.from(dependentMap.keys()).map(propertyName => [propertyName, getDependentProps(new Set, propertyName)]));
    this.globals = Globals.create(component);

  }

  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }

  async [SYM_CALL_INIT](target, receiver) {
    if (!("$oninit" in target)) return;
    return await Reflect.apply(target["$oninit"], receiver, []);
  }

  async [SYM_CALL_CONNECT](target, receiver) {
    if (!("$onconnect" in target)) return;
    return await Reflect.apply(target["$onconnect"], receiver, []);
  }

  /**
   * 
   * @param {string} prop 
   * @param {number[]} indexes 
   * @param {*} target 
   * @param {*} receiver 
   */
  [SYM_CALL_WRITE](prop, indexes, target, receiver) {
    if ("$onwrite" in target) {
      const { component } = this;
      const process = new ProcessData(target["$onwrite"], receiver, [ prop, indexes ]);
      component.updateSlot.addProcess(process);
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {Proxy<ViewModel>} receiver 
   */
  #getDefinedPropertyValue(target, prop, receiver) {
    const { component, lastIndexes, cache, setOfCachablePropertyNames } = this;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    let value;
    if (setOfCachablePropertyNames.has(prop.name)) {
      const cacheValue = cache.get(prop, indexes);
      if (typeof cacheValue === "undefined") {
        value = Reflect.get(target, prop.name, receiver);
        cache.set(prop, indexes, value);
      } else {
        value = cacheValue;
      }
    } else {
      value = Reflect.get(target, prop.name, receiver);
    }
    return wrapArray(component, prop, indexes, value);
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

  [SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](propertyName, indexes, target, receiver) {
    const { dependentMap, setOfDependentPropNamesByPropName, component } = this;
    if (dependentMap.has(propertyName)) {
      const dependentPropNames = setOfDependentPropNamesByPropName.get(propertyName) ?? new Set;
      dependentPropNames.forEach(definedPropertyName => {
        
        if (definedPropertyName.startsWith("$data")) {
          component.updateSlot.addNotify(new NotifyData(component, definedPropertyName, []));
        } else {
          const definedProperty = PropertyInfo.create(definedPropertyName);
          if (indexes.length < definedProperty.loopLevel) {
            const listOfIndexes = definedProperty.expand(receiver, indexes);
            listOfIndexes.forEach(depIndexes => {
              component.updateSlot.addNotify(new NotifyData(component, definedProperty.name, depIndexes));
            });
          } else {
            const depIndexes = indexes.slice(0, definedProperty.loopLevel);
            component.updateSlot.addNotify(new NotifyData(component, definedProperty.name, depIndexes));
          }
  
        }
      });
    }
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
  #setDefinedPropertyValue(target, prop, value, receiver) {
    const { component, lastIndexes, cache } = this;
    value = value?.[SYM_GET_IS_PROXY] ? value[SYM_GET_RAW] : value;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    Reflect.set(target, prop.name, value, receiver);

    component.updateSlot.addNotify(new NotifyData(component, prop.name, indexes));

    this[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](prop.name, indexes, target, receiver);

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
   * @param {string} prop 
   * @returns {{loopProperty:PropertyInfo,indexes:number[]}}
   */
  #getLoopPropertyAndIndexesFromPropertyName(prop) {
    let { loopProperty, indexes } = this.propertyInfoAndIndexesByProp.get(prop) ?? {};
    if (typeof loopProperty === "undefined") {
      for(const property of this.loopProperties) {
        const result = property.regexp.exec(prop);
        if (result) {
          indexes = result.slice(1).map(Number);
          loopProperty = property;
          this.propertyInfoAndIndexesByProp.set(prop, { loopProperty, indexes });
          break;
        }
      }
    }
    return { loopProperty, indexes };
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy<ViewModel>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (typeof prop === "symbol") {
      const { lastIndexes, dependentMap } = this;
      switch(prop) {
        case SYM_CALL_DIRECT_GET:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_DIRECT_GET], this, [prop, indexes, target, receiver]);
        case SYM_CALL_DIRECT_SET:
          return (prop, indexes, value) => 
            Reflect.apply(this[SYM_CALL_DIRECT_SET], this, [prop, indexes, value, target, receiver]);
        case SYM_GET_INDEXES:
          return lastIndexes;
        case SYM_CALL_DIRECT_CALL:
          return (prop, indexes, event) => 
            Reflect.apply(this[SYM_CALL_DIRECT_CALL], this, [prop, indexes, event, target, receiver]);
        case SYM_CALL_INIT:
          return () => 
            Reflect.apply(this[SYM_CALL_INIT], this, [target, receiver]);
        case SYM_CALL_WRITE:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_WRITE], this, [prop, indexes, target, receiver]);
        case SYM_CALL_CONNECT:
          return () => 
            Reflect.apply(this[SYM_CALL_CONNECT], this, [target, receiver]);
        case SYM_CALL_CLEAR_CACHE:
          return () => 
            Reflect.apply(this[SYM_CALL_CLEAR_CACHE], this, [target, receiver]);
        case SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS], this, [prop, indexes, target, receiver]);
        case SYM_GET_TARGET:
          return target;
        case SYM_GET_DEPENDENT_MAP:
          return dependentMap;
      }
    }
    if (SET_OF_CONTEXT_ALL_PARAMS.has(prop)) {
      const { lastIndexes, component } = this;
      if (SET_OF_CONTEXT_INDEXES.has(prop)) {
        return lastIndexes[Number(prop.slice(1)) - 1];
      } else {
        switch(prop) {
          case CONTEXT_COMPONENT:
            return component;
          case CONTEXT_DATA:
            return component.data;
          case CONTEXT_OPEN_DIALOG:
            return async (name, data, attributes) => {
              const dialog = document.createElement(main.prefix ? (main.prefix + "-" + name) : name);
              Object.entries(attributes ?? {}).forEach(([key, value]) => {
                dialog.setAttribute(key, value);
              });
              dialog.data[SYM_CALL_BIND_DATA](data ?? {});
              document.body.appendChild(dialog);
              return dialog.alivePromise;
            };
          case CONTEXT_CLOSE_DIALOG:
            return (data) => {
              Object.assign(component.data, data);
              component.parentNode.removeChild(component);
            };
          case CONTEXT_NOTIFY:
            return (prop, indexes) => {
              component.updateSlot.addNotify(new NotifyData(component, prop, indexes));
            };
          case CONTEXT_GLOBALS:
            return this.globals;
        }
      }
    }

    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      // すでに、indexesはセットされている
      return this.#getDefinedPropertyValue(target, defindedProperty, receiver);
    } else {
      if (prop[0] === "@") {
        const propName = prop.slice(1);
        const defindedProperty = this.definedPropertyByProp.get(propName);
        if (defindedProperty) {
          return defindedProperty.expand(receiver, []).map(indexes => {
            const value = this[SYM_CALL_DIRECT_GET](propName, indexes, target, receiver);
            return [ value, indexes];
          });
        }
      }
      if (prop[0] !== "_") {
        const {loopProperty, indexes} = this.#getLoopPropertyAndIndexesFromPropertyName(prop);
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
      if (prop[0] === "@") {
        const propName = prop.slice(1);
        const defindedProperty = this.definedPropertyByProp.get(propName);
        if (defindedProperty) {
          defindedProperty.expand(receiver, []).forEach(indexes => {
            this[SYM_CALL_DIRECT_SET](propName, indexes, value, target, receiver);
          });
          return true;
        }
      }
      if (prop[0] !== "_") {
        const {loopProperty, indexes} = this.#getLoopPropertyAndIndexesFromPropertyName(prop);
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
  const { viewModel, definedProperties, dependentMap, cachablePropertyNames } = Accessor.convert(component, origViewModel);
  return new Proxy(viewModel, new Handler(component, definedProperties, dependentMap, cachablePropertyNames));

}