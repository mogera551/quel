import "../types.js";
import { 
  SYM_GET_INDEXES, SYM_GET_TARGET, 
  SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_CALL,
  SYM_CALL_INIT, SYM_CALL_WRITE
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

  #getPropertyValue(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    return value;
  }
  [SYM_CALL_DIRECT_GET](prop, indexes, target, receiver) {
    let value;
    this.stackIndexes.push(indexes);
    try {
      value = this.#getPropertyValue(target, prop, receiver);
    } finally {
      this.stackIndexes.pop();
    }
    return value;

  }

  #setPropertyValue(target, prop, value, receiver) {
    const indexes = this.lastIndexes;
    Reflect.set(target, prop, value, receiver);
    receiver[SYM_CALL_WRITE](prop, indexes);

    const notify = new NotifyData(this.component, prop, indexes);
    Thread.current.addNotify(notify);
//    this.component.notify(prop, indexes)

    return true;
  }
  [SYM_CALL_DIRECT_SET](prop, indexes, value, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      this.#setPropertyValue(target, prop, value, receiver);
    } finally {
      this.stackIndexes.pop();
    }
  }

  async [SYM_CALL_DIRECT_CALL](prop, indexes, event, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      await Reflect.apply(target[prop], receiver, [event, ...indexes]);
    } finally {
      this.stackIndexes.pop();
    }
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
      }
    }
    if (CONTEXT_INDEXES.has(prop)) {
      return this.lastIndexes[parseInt(prop.slice(1)) - 1];
    }

    if (this.definedPropertyByProp.has(prop)) {
      return this.#getPropertyValue(target, prop, receiver);
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
    if (this.definedPropertyByProp.has(prop)) {
      return this.#setPropertyValue(target, prop, value, receiver);
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
 */
export default function create(component, origViewModel) {
  const { viewModel, definedProperties } = Accessor.convert(component, origViewModel);
  return new Proxy(viewModel, new Handler(component, definedProperties));

}