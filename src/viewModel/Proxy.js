import "../types.js";
import myname from "../myname.js";

const CONTEXT_INDEXES = new Set([
  "$1", "$2", "$3", "$4", "$5", "$6", "$7", "$8"
]);

class Handler {
  stackIndexes = [];
  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }
  async [Symbol.for(`${myname}:viewModel.init`)](target, receiver) {
    if (!("$oninit" in target)) return;
    return Reflect.apply(target["$oninit"], receiver, []);
  }

  [Symbol.for(`${myname}:viewModel.directGet`)](prop, indexes, stackIndexes, target, receiver) {
    let value;
    stackIndexes.push(indexes);
    try {
      value = Reflect.get(target, prop, receiver);
    } finally {
      stackIndexes.pop();
    }
    return value;

  }

  [Symbol.for(`${myname}:viewModel.directSet`)](prop, indexes, value, stackIndexes, target, receiver) {
    stackIndexes.push(indexes);
    try {
      Reflect.set(target, prop, value, receiver);
    } finally {
      stackIndexes.pop();
    }
  }

  async [Symbol.for(`${myname}:viewModel.directCall`)](prop, indexes, event, stackIndexes, target, receiver) {
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
      if (prop === Symbol.for(`${myname}:viewModel.init`)) {
        return async () => 
          await Reflect.apply(this[Symbol.for(`${myname}:viewModel.init`)], receiver, [target, receiver]);
      }
      else if (prop === Symbol.for(`${myname}:viewModel.directGet`)) {
        return (prop, indexes) => 
          Reflect.apply(this[Symbol.for(`${myname}:viewModel.directGet`)], receiver, [prop, indexes, stackIndexes, target, receiver]);
      }
      else if (prop === Symbol.for(`${myname}:viewModel.directSet`)) {
        return (prop, indexes, value) => 
          Reflect.apply(this[Symbol.for(`${myname}:viewModel.directSet`)], receiver, [prop, indexes, value, stackIndexes, target, receiver]);
      }
      else if (prop === Symbol.for(`${myname}:viewModel.directCall`)) {
        return (prop, indexes, event) => 
          Reflect.apply(this[Symbol.for(`${myname}:viewModel.directCall`)], receiver, [prop, indexes, event, stackIndexes, target, receiver]);
      }
    }
    if (CONTEXT_INDEXES.has(prop)) {
      return this.lastIndexes[parseInt(prop[1]) - 1];
    }
    return Reflect.get(target, prop, receiver);
  }

}

/**
 * 
 * @param {ViewModel} viewModel 
 */
export default function create(viewModel) {
  return new Proxy(viewModel, new Handler);

}