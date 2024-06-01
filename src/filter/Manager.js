import "../types.js"
import { utils } from "../utils.js";

/**
 * @typedef {object} FilterGroup
 * @property {class} ObjectClass
 * @property {string} prefix
 * @property {Set<string>} prototypeFuncs
 * @property {Set<string>} staticFuncs
 * @property {FilterTypeFunc} typeFunc
 */

/** @type {FilterGroup} */
const objectFilterGroup = {
  ObjectClass: Object,
  prefix: "o",
  prototypeFuncs: new Set([
    "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", 
  ]),
  staticFuncs: new Set([
    "create", "defineProperties", "defineProperty", "entries", "fromEntries", 
    "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols", 
    "getPrototypeOf", "is", "isExtensible", "isFrozen", 
    "isSealed", "keys", "preventExtensions", "values", 
  ]),
};

/** @type {FilterGroup} */
const arrayFilterGroup = {
  ObjectClass: Array,
  prefix: "a",
  prototypeFuncs: new Set([
    "at", "concat", "entries", "flat", 
    "includes", "indexOf", "join", "keys", 
    "lastIndexOf", "slice", "toLocaleString", "toReversed", 
    "toSorted", "toSpliced", "values", "with"
  ]),
  staticFuncs: new Set([
    "from", "isArray", "of"
  ]),
};

/** @type {FilterGroup} */
const numberFilterGroup = {
  ObjectClass: Number,
  prefix: "n",
  prototypeFuncs: new Set([
    "toExponential", "toFixed", "toLocaleString", "toPrecision"
  ]),
  staticFuncs: new Set([
    "isFinite", "isInteger", "isNaN", "isSafeInteger", 
    "parseFloat", "parseInt"
  ]),
};

/** @type {FilterGroup} */
const stringFilterGroup = {
  ObjectClass: String,
  prefix: "s",
  prototypeFuncs: new Set([
    "at", "charAt", "charCodeAt", "codePointAt",
    "concat", "endsWith", "includes", "indexOf",
    "lastIndexOf", "localeCompare", "match", "normalize",
    "padEnd", "padStart", "repeat", "replace",
    "replaceAll", "search", "slice", "split",
    "startsWith", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
    "toLowerCase", "toUpperCase", "trim", "trimEnd",
    "trimStart",
  ]),
  staticFuncs: new Set([
    "fromCharCode", "fromCodePoint", "raw"
  ]),
};

/** @type {FilterGroup} */
const dateFilterGroup = {
  ObjectClass: Date,
  prefix: "date",
  prototypeFuncs: new Set([
    "getDate", "getDay", "getFullYear", "getHours",
    "getMilliseconds", "getMinutes", "getMonth", "getSeconds",
    "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
    "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
    "getUTCMonth", "getUTCSeconds", "toDateString", "toISOString",
    "toJSON", "toLocaleDateString", "toLocaleString", "toLocaleTimeString",
    "toTimeString", "toUTCString",
  ]),
  staticFuncs: new Set([
    "now", "parse", "UTC"
  ]),
};

/** @type {FilterGroup} */
const setFilterGroup = {
  ObjectClass: Set,
  prefix: "set",
  prototypeFuncs: new Set([
    "entries", "forEach", "has", "keys", "values"
  ]),
  staticFuncs: new Set([
  ]),
};

/** @type {FilterGroup} */
const mapFilterGroup = {
  ObjectClass: Map,
  prefix: "map",
  prototypeFuncs: new Set([
    "entries", "forEach", "get", "has", "keys", "values"
  ]),
  staticFuncs: new Set([
    "groupBy",
  ]),
};

/** @type {FilterGroup} */
const JSONFilterGroup = {
  ObjectClass: JSON,
  prefix: "json",
  prototypeFuncs: new Set([]),
  staticFuncs: new Set([
    "parse", "stringify"
  ]),
};

/** @type {FilterGroup} */
const mathFilterGroup = {
  ObjectClass: Math,
  prefix: "math",
  prototypeFuncs: new Set([]),
  staticFuncs: new Set([
    "abs", "acos", "acosh", "asin",
    "asinh", "atan", "atan2", "atanh",
    "cbrt", "ceil", "clz32", "cos",
    "cosh", "exp", "expm1", "floor",
    "fround", "hypot", "imul", "log",
    "log10", "log1p", "log2", "max",
    "min", "pow", "random", "round",
    "sign", "sin", "sinh", "sqrt",
    "tan", "tanh", "trunc"
  ]),
};

/** @type {FilterGroup} */
const regExpFilterGroup = {
  ObjectClass: RegExp,
  prototypeFuncs: new Set([
    "exec", "test"
  ]),
  staticFuncs: new Set([
  ]),
};

class DefaultFilters {
  static truthy       = options => value => value ? true : false;
  static falsey       = options => value => !value ? true : false;
  static not          = this.falsey;
  static eq           = options => value => value == options[0]; // equality
  static ne           = options => value => value != options[0]; // inequality
  static lt           = options => value => Number(value) < Number(options[0]); // less than
  static le           = options => value => Number(value) <= Number(options[0]); // less than or equal
  static gt           = options => value => Number(value) > Number(options[0]); // greater than
  static ge           = options => value => Number(value) >= Number(options[0]); // greater than or equal
  static oi           = options => value => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
  static ci           = options => value => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
  static embed        = options => value => (value != null) ? (options[0] ?? "").replaceAll("%s", value) : null;
  static iftext       = options => value => value ? options[0] ?? null : options[1] ?? null;
  static null         = options => value => (value == null) ? true : false;
  static offset       = options => value => Number(value) + Number(options[0]);
  static unit         = options => value => String(value) + String(options[0]);
  static inc          = this.offset;
  static mul          = options => value => Number(value) * Number(options[0]);
  static div          = options => value => Number(value) / Number(options[0]);
  static mod          = options => value => Number(value) % Number(options[0]);
  static prop         = options => value => value[options[0]];
  static prefix       = options => value => String(options[0]) + String(value);
  static suffix       = this.unit;
  static date         = options => value => Date.prototype.toLocaleDateString.apply(value, ["sv-SE", options[0] ? options[0] : {}]);

}

/** @type {FilterGroup} */
const defaultFilterGroup = {
  ObjectClass: DefaultFilters,
  prefix: "",
  prototypeFuncs: new Set([
  ]),
  staticFuncs: new Set([
    "truthy", "falsey", "not", "eq", "ne", "lt", "le", "gt", "ge", "oi", "ci", 
    "embed", "iftext", "null", "offset", "unit", "inc", "mul", "div", "mod", 
    "prop", "prefix", "suffix", "date"
  ]),
};

/**
 * 
 * @param {class} ObjectClass 
 * @param {string} FuncName 
 * @returns {FilterFuncWithOption}
 */
function createPrototypeFilterFunc(ObjectClass, FuncName) {
  const func = ObjectClass.prototype[FuncName];
  return (options) => {
    return (value) => {
      return func.apply(value, options);
    };
  };
}

/**
 * 
 * @param {class} ObjectClass 
 * @param {string} FuncName 
 * @returns {FilterFuncWithOption}
 */
function createStaticFilterFunc(ObjectClass, FuncName) {
  const func = ObjectClass[FuncName];
  return (options) => {
    return (value) => {
      return func.apply(null, [value, ...options]);
    };
  };
}

const outputGroups = [
  dateFilterGroup, setFilterGroup, mapFilterGroup, JSONFilterGroup, 
  regExpFilterGroup, arrayFilterGroup, objectFilterGroup, 
  numberFilterGroup, stringFilterGroup, mathFilterGroup,
];

export class FilterManager {
  /** @type {Set<string>} */
  ambigousNames;
  /** @type {Map<string, FilterFuncWithOption>} */
  funcByName;

  /**
   * register user defined filter 
   * @param {string} name 
   * @param {FilterFuncWithOption} filterFunc 
   */
  registerFilter(name, filterFunc) {
    if (this.funcByName.has(name)) {
      utils.raise(`${this.constructor.name}: ${name} is already registered`);
    }
    this.funcByName.set(name, filterFunc);
  }

  /**
   * get filter function by name
   * @param {string} name 
   * @returns {FilterFuncWithOption}
   */
  getFilterFunc(name) {
    const func = this.funcByName.get(name);
    return func ?? (options => value => value);
  }

  /**
   * 
   * @param {any} value 
   * @param {FilterFunc[]} filters 
   * @returns {any}
   */
  static applyFilter(value, filters) {
    return filters.reduce((value, filter) => filter(value), value);
  }
}

export class OutputFilterManager extends FilterManager {
  constructor() {
    super();
    this.ambigousNames = new Set(OutputFilterManager.#ambigousNames);
    this.funcByName = new Map(OutputFilterManager.#funcByName);
  }
  /** @type {Set<string>} */
  static #ambigousNames = new Set;
  /** @type {Map<string, FilterFuncWithOption>} */
  static #funcByName = new Map;
  static {
    const ambigousNames = new Set;
    const funcByName = new Map;
    for(const group of outputGroups) {
      for(const funcName of group.prototypeFuncs) {
        const uniqueFuncName = `${group.prefix}.${funcName}`;
        const func = createPrototypeFilterFunc(group.ObjectClass, funcName);
        funcByName.set(uniqueFuncName, func);
        if (funcByName.has(funcName)) {
          ambigousNames.add(funcName);
        } else {
          funcByName.set(funcName, func);
        }
      }
      for(const funcName of group.staticFuncs) {
        const uniqueFuncName = `${group.prefix}.${funcName}`;
        const func = createStaticFilterFunc(group.ObjectClass, funcName);
        funcByName.set(uniqueFuncName, func);
        if (funcByName.has(funcName)) {
          ambigousNames.add(funcName);
        } else {
          funcByName.set(funcName, func);
        }
      }
    }
    for(const funcName of defaultFilterGroup.staticFuncs) {
      const func = DefaultFilters[funcName];
      funcByName.set(funcName, func);
    }
    for(const funcName of ambigousNames) {
      funcByName.delete(funcName);
    }
    this.#ambigousNames = ambigousNames;
    this.#funcByName = funcByName;
  }
  /**
   * 
   * @param {string} name 
   * @param {FilterFuncWithOption} filterFunc 
   */
  static registerFilter(name, filterFunc) {
    if (this.#funcByName.has(name)) {
      utils.raise(`${this.name}: ${name} is already registered`);
    }
    this.#funcByName.set(name, filterFunc);
  }

}

class InputFilters {
  static date         = options => value => value === "" ? null : new Date(new Date(value).setHours(0));
  static number       = options => value => value === "" ? null : Number(value);
  static boolean      = options => value => (value === "false" || value === "") ? false : true;
}

export class InputFilterManager extends FilterManager {
  constructor() {
    super();
    this.ambigousNames = new Set(InputFilterManager.#ambigousNames);
    this.funcByName = new Map(InputFilterManager.#funcByName);
  }
  /** @type {Set<string>} */
  static #ambigousNames = new Set;
  /** @type {Map<string, FilterFuncWithOption>} */
  static #funcByName = new Map;
  static {
    this.#funcByName.set("date", InputFilters.date);
    this.#funcByName.set("number", InputFilters.number);
    this.#funcByName.set("boolean", InputFilters.boolean);
  }
  /**
   * 
   * @param {string} name 
   * @param {FilterFuncWithOption} filterFunc 
   */
  static registerFilter(name, filterFunc) {
    if (this.#funcByName.has(name)) {
      utils.raise(`${this.name}: ${name} is already registered`);
    }
    this.#funcByName.set(name, filterFunc);
  }
}

class EventFilters {
  static preventDefault = options => event => {
    event.preventDefault();
    return event;
  }
  static noStopPropagation = options => event => {
    event.noStopPropagation = true;
    return event;
  }
  static pd = this.preventDefault;
  static nsp = this.noStopPropagation;
}

export class EventFilterManager extends FilterManager {
  constructor() {
    super();
    this.ambigousNames = new Set(EventFilterManager.#ambigousNames);
    this.funcByName = new Map(EventFilterManager.#funcByName);
  }
  /** @type {Set<string>} */
  static #ambigousNames = new Set;
  /** @type {Map<string, EventFilterFuncWithOption>} */
  static #funcByName = new Map;
  static {
    this.#funcByName.set("preventDefault", EventFilters.preventDefault);
    this.#funcByName.set("noStopPropagation", EventFilters.noStopPropagation);
    this.#funcByName.set("pd", EventFilters.preventDefault);
    this.#funcByName.set("nsp", EventFilters.noStopPropagation);
  }
  /**
   * 
   * @param {string} name 
   * @param {FilterFuncWithOption} filterFunc 
   */
  static registerFilter(name, filterFunc) {
    if (this.#funcByName.has(name)) {
      utils.raise(`${this.name}: ${name} is already registered`);
    }
    this.#funcByName.set(name, filterFunc);
  } 
}
