import "../types.js";
import { 
  SYM_GET_INDEXES, SYM_GET_TARGET, 
  SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_CALL,
  SYM_CALL_INIT, SYM_CALL_WRITE
} from "./Symbols.js";
import Component from "../component/Component.js";
import Accessor from "./Accessor.js";

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
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.component = component;
  }

  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }

  async [SYM_CALL_INIT](target, receiver) {
    if (!("$oninit" in target)) return;
    return await Reflect.apply(target["$oninit"], receiver, []);
  }

  async [SYM_CALL_WRITE](prop, indexes, target, receiver) {
    if (!("$onwrite" in target)) return;
    await Reflect.apply(target["$onwrite"], receiver, [ prop, indexes ]);
    this.component.notify(prop, indexes)
  }

  [SYM_CALL_DIRECT_GET](prop, indexes, target, receiver) {
    let value;
    this.stackIndexes.push(indexes);
    try {
      value = Reflect.get(target, prop, receiver);
    } finally {
      this.stackIndexes.pop();
    }
    return value;

  }

  [SYM_CALL_DIRECT_SET](prop, indexes, value, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      Reflect.set(target, prop, value, receiver);
      receiver[SYM_CALL_WRITE](prop, indexes);
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
          return prop => 
            Reflect.apply(this[SYM_CALL_WRITE], this, [prop, target, receiver]);
      }
    }
    if (CONTEXT_INDEXES.has(prop)) {
      return this.lastIndexes[parseInt(prop.slice(1)) - 1];
    }
    return Reflect.get(target, prop, receiver);
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    receiver[SYM_CALL_WRITE](prop, this.lastIndexes);
    return true;
  }
}

/**
 * 
 * @param {Component} component
 * @param {ViewModel} viewModel 
 */
export default function create(component, viewModel) {
  return new Proxy(Accessor.convert(component, viewModel), new Handler(component));

}