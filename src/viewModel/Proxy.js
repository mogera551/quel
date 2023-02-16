import "../types.js";
import { 
  SYM_GET_INDEXES, SYM_GET_TARGET, 
  SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_CALL,
  SYM_CALL_INIT
} from "./Symbols.js";
import Component from "../component/Component.js";
import Accessor from "./Accessor.js";

const MAX_INDEXES_LEVEL = 8;
const CONTEXT_INDEXES = new Set(
  [...Array(MAX_INDEXES_LEVEL)].map((content,index) => `$${index + 1}`)   
);

class Handler {
  stackIndexes = [];
  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }
  async [SYM_CALL_INIT](target, receiver) {
    if (!("$oninit" in target)) return;
    return Reflect.apply(target["$oninit"], receiver, []);
  }

  [SYM_CALL_DIRECT_GET](prop, indexes, stackIndexes, target, receiver) {
    let value;
    stackIndexes.push(indexes);
    try {
      value = Reflect.get(target, prop, receiver);
    } finally {
      stackIndexes.pop();
    }
    return value;

  }

  [SYM_CALL_DIRECT_SET](prop, indexes, value, stackIndexes, target, receiver) {
    stackIndexes.push(indexes);
    try {
      Reflect.set(target, prop, value, receiver);
    } finally {
      stackIndexes.pop();
    }
  }

  async [SYM_CALL_DIRECT_CALL](prop, indexes, event, stackIndexes, target, receiver) {
    stackIndexes.push(indexes);
    try {
      await Reflect.apply(target[prop], receiver, [event, ...indexes]);
    } finally {
      stackIndexes.pop();
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
          return this.stackIndexes.at(-1);
        case SYM_GET_TARGET:
          return target;
        case SYM_CALL_DIRECT_GET:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_DIRECT_GET], receiver, [prop, indexes, stackIndexes, target, receiver]);
        case SYM_CALL_DIRECT_SET:
          return (prop, indexes, value) => 
            Reflect.apply(this[SYM_CALL_DIRECT_SET], receiver, [prop, indexes, value, stackIndexes, target, receiver]);
        case SYM_CALL_DIRECT_CALL:
          return (prop, indexes, event) => 
            Reflect.apply(this[SYM_CALL_DIRECT_CALL], receiver, [prop, indexes, event, stackIndexes, target, receiver]);
        case SYM_CALL_INIT:
          return async () => 
            await Reflect.apply(this[SYM_CALL_INIT], receiver, [target, receiver]);
      }
    }
    if (CONTEXT_INDEXES.has(prop)) {
      return this.lastIndexes[parseInt(prop.slice(1)) - 1];
    }
    return Reflect.get(target, prop, receiver);
  }

}

/**
 * 
 * @param {Component} component
 * @param {ViewModel} viewModel 
 */
export default function create(component, viewModel) {
  return new Proxy(Accessor.convert(component, viewModel), new Handler);

}