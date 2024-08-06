import { utils } from "../utils";
import { IFilterInfo, FilterFunc, FilterFuncWithOption, EventFilterFunc, EventFilterFuncWithOption } from "./types";

/**
 * ambigous name:
 * "entries", "forEach", "has", "keys", "values", "parse",
 * "toString", "toLocaleString", "valueOf", "at", "concat", 
 * "includes", "indexOf", "lastIndexOf", "slice"
 */

type ClassName = (Object | typeof Array | Number | String | Date | typeof Set | typeof Map | JSON | Math | RegExp | DefaultFilters);
type FilterGroup = {
  objectClass: ClassName,
  prefix: string,
  prefixShort: string,
  prototypeFuncs: Set<string>,
  staticFuncs: Set<string>,
}

const objectFilterGroup:FilterGroup = {
  objectClass: Object,
  prefix: "object",
  prefixShort: "o",
  prototypeFuncs: new Set([
    "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", 
    "toString", "valueOf",
  ]),
  staticFuncs: new Set([
    "create", "defineProperties", "defineProperty", "entries", "fromEntries", 
    "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols", 
    "getPrototypeOf", "is", "isExtensible", "isFrozen", 
    "isSealed", "keys", "preventExtensions", "values", 
  ]),
  
};

const arrayFilterGroup:FilterGroup = {
  objectClass: Array,
  prefix: "array",
  prefixShort: "a",
  prototypeFuncs: new Set([
    "at", "concat", "entries", "flat", 
    "includes", "indexOf", "join", "keys", 
    "lastIndexOf", "slice", "toLocaleString", "toReversed", 
    "toSorted", "toSpliced", "values", "with", "toString",
  ]),
  staticFuncs: new Set([
    "from", "isArray", "of"
  ]),
};

const numberFilterGroup:FilterGroup = {
  objectClass: Number,
  prefix: "number",
  prefixShort: "n",
  prototypeFuncs: new Set([
    "toExponential", "toFixed", "toLocaleString", "toPrecision",
    "toString", "valueOf",
  ]),
  staticFuncs: new Set([
    "isFinite", "isInteger", "isNaN", "isSafeInteger", 
    "parseFloat", "parseInt"
  ]),
};

const stringFilterGroup:FilterGroup = {
  objectClass: String,
  prefix: "string",
  prefixShort: "s",
  prototypeFuncs: new Set([
    "at", "charAt", "charCodeAt", "codePointAt",
    "concat", "endsWith", "includes", "indexOf",
    "lastIndexOf", "localeCompare", "match", "normalize",
    "padEnd", "padStart", "repeat", "replace",
    "replaceAll", "search", "slice", "split",
    "startsWith", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
    "toLowerCase", "toUpperCase", "trim", "trimEnd",
    "trimStart", "valueOf", "toString",
  ]),
  staticFuncs: new Set([
    "fromCharCode", "fromCodePoint", "raw"
  ]),
};

const dateFilterGroup:FilterGroup = {
  objectClass: Date,
  prefix: "date",
  prefixShort: "",
  prototypeFuncs: new Set([
    "getDate", "getDay", "getFullYear", "getHours",
    "getMilliseconds", "getMinutes", "getMonth", "getSeconds",
    "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
    "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
    "getUTCMonth", "getUTCSeconds", "toDateString", "toISOString",
    "toJSON", "toLocaleDateString", "toLocaleString", "toLocaleTimeString",
    "toTimeString", "toUTCString", "valueOf", "toString",
  ]),
  staticFuncs: new Set([
    "now", "parse", "UTC"
  ]),
};

const setFilterGroup:FilterGroup = {
  objectClass: Set,
  prefix: "set",
  prefixShort: "",
  prototypeFuncs: new Set([
    "entries", "forEach", "has", "keys", "values"
  ]),
  staticFuncs: new Set([
  ]),
};

const mapFilterGroup:FilterGroup = {
  objectClass: Map,
  prefix: "map",
  prefixShort: "",
  prototypeFuncs: new Set([
    "entries", "forEach", "get", "has", "keys", "values"
  ]),
  staticFuncs: new Set([
    "groupBy",
  ]),
};

const JSONFilterGroup:FilterGroup = {
  objectClass: JSON,
  prefix: "json",
  prefixShort: "",
  prototypeFuncs: new Set([]),
  staticFuncs: new Set([
    "parse", "stringify"
  ]),
};

const mathFilterGroup:FilterGroup = {
  objectClass: Math,
  prefix: "math",
  prefixShort: "",
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

const regExpFilterGroup:FilterGroup = {
  objectClass: RegExp,
  prefix: "regexp",
  prefixShort: "",
  prototypeFuncs: new Set([
    "exec", "test", "toString"
  ]),
  staticFuncs: new Set([
  ]),
};

class DefaultFilters {
  static "truthy*"    = (options:any[]) => (value:any) => value ? true : false;
  static "falsey*"    = (options:any[]) => (value:any) => !value ? true : false;
  static "not*"       = this["falsey*"];
  static eq           = (options:any[]) => (value:any) => value == options[0]; // equality
  static ne           = (options:any[]) => (value:any) => value != options[0]; // inequality
  static lt           = (options:any[]) => (value:any) => Number(value) < Number(options[0]); // less than
  static le           = (options:any[]) => (value:any) => Number(value) <= Number(options[0]); // less than or equal
  static gt           = (options:any[]) => (value:any) => Number(value) > Number(options[0]); // greater than
  static ge           = (options:any[]) => (value:any) => Number(value) >= Number(options[0]); // greater than or equal
  static oi           = (options:any[]) => (value:any) => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
  static ci           = (options:any[]) => (value:any) => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
  static embed        = (options:any[]) => (value:any) => (options[0] ?? "").replaceAll("%s", value);
  static iftext       = (options:any[]) => (value:any) => value ? options[0] ?? null : options[1] ?? null;
  static "isnull*"    = (options:any[]) => (value:any) => (value == null) ? true : false;
  static offset       = (options:any[]) => (value:any) => Number(value) + Number(options[0]);
  static unit         = (options:any[]) => (value:any) => String(value) + String(options[0]);
  static inc          = this.offset;
  static mul          = (options:any[]) => (value:any) => Number(value) * Number(options[0]);
  static div          = (options:any[]) => (value:any) => Number(value) / Number(options[0]);
  static mod          = (options:any[]) => (value:any) => Number(value) % Number(options[0]);
  static prop         = (options:any[]) => (value:any) => value[options[0]];
  static prefix       = (options:any[]) => (value:any) => String(options[0]) + String(value);
  static suffix       = this.unit;
  static date         = (options:any[]) => (value:any) => Date.prototype.toLocaleDateString.apply(value, ["sv-SE", options[0] ? options[0] : {}]);
  static "isnan*"     = (options:any[]) => (value:any) => isNaN(value);
}

const defaultFilterGroup:FilterGroup = {
  objectClass: DefaultFilters,
  prefix: "",
  prefixShort: "",
  prototypeFuncs: new Set([
  ]),
  staticFuncs: new Set([
    "truthy*", "falsey*", "not*", "eq", "ne", "lt", "le", "gt", "ge", "oi", "ci", 
    "embed", "iftext", "isnull*", "offset", "unit", "inc", "mul", "div", "mod", 
    "prop", "prefix", "suffix", "date", "isnan*",
  ]),
};

function createPrototypeFilterFunc(ObjectClass:ClassName , FuncName:string):(FilterFuncWithOption|undefined) {
  if (Reflect.has(ObjectClass, "prototype")) {
    const prototype = Reflect.get(ObjectClass, "prototype");
    if (Reflect.has(prototype, FuncName)) {
      const func = Reflect.get(prototype, FuncName);
      return (options:any[]) => (value:any) => func.apply(value, options);
    }
  }
  return undefined;
}

function createStaticFilterFunc(ObjectClass:ClassName, FuncName:string):(FilterFuncWithOption|undefined) {
  if (Reflect.has(ObjectClass, FuncName)) {
    const func = Reflect.get(ObjectClass, FuncName);
    return (options:any[]) => (value:any) => func.apply(null, [value, ...options]);
  }
  return undefined;
}

const outputGroups = [
  dateFilterGroup, setFilterGroup, mapFilterGroup, JSONFilterGroup, 
  regExpFilterGroup, arrayFilterGroup, objectFilterGroup, 
  numberFilterGroup, stringFilterGroup, mathFilterGroup,
];

const nullthru = (callback:FilterFuncWithOption):FilterFuncWithOption => 
  (options:any[]) => (value:any) => value == null ? value : callback(options)(value);

const reduceApplyFilter = (value:any, filter:FilterFunc) => filter(value);

const thru:FilterFuncWithOption = (options:any[]) => (value:any):any => value;

export class Filters {

  static create(filters:IFilterInfo[], manager:FilterManager) {
    const filterFuncs = [];
    for(let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      filterFuncs.push(manager.getFilterFunc(filter.name)(filter.options));
    }
    return filterFuncs;
  }
}

export class FilterManager {
  ambigousNames:Set<string> = new Set;
  funcByName:(Map<string, FilterFuncWithOption>|Map<string, EventFilterFuncWithOption>) = new Map;

  /**
   * register user defined filter, check duplicate name
   */
  registerFilter(funcName:string, filterFunc:FilterFuncWithOption):void {
    const isNotNullThru = funcName.endsWith("*");
    const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;

    if (this.funcByName.has(realFuncName)) {
      utils.raise(`${this.constructor.name}: ${realFuncName} is already registered`);
    }
    const wrappedFunc = !isNotNullThru ? nullthru(filterFunc) : filterFunc;
    (this.funcByName as Map<string, FilterFuncWithOption>).set(realFuncName, wrappedFunc);
  }

  /**
   * get filter function by name
   */
  getFilterFunc(name:string):FilterFuncWithOption {
    this.ambigousNames.has(name) && utils.raise(`${this.constructor.name}: ${name} is ambigous`);
    return (this.funcByName.get(name) ?? thru) as FilterFuncWithOption;
  }

  static applyFilter(value:any, filters:FilterFunc[]) {
    return filters.reduce(reduceApplyFilter, value);
  }
}

export class OutputFilterManager extends FilterManager {
  constructor() {
    super();
    this.ambigousNames = new Set(OutputFilterManager.#ambigousNames);
    this.funcByName = new Map(OutputFilterManager.#funcByName);
  }
  static #ambigousNames:Set<string> = new Set;
  static #funcByName:Map<string, FilterFuncWithOption> = new Map;
  static {
    const ambigousNames:Set<string> = new Set;
    const funcByName:Map<string, FilterFuncWithOption> = new Map;
    for(const group of outputGroups) {
      for(const funcName of group.prototypeFuncs) {
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        const func = createPrototypeFilterFunc(group.objectClass, realFuncName);
        if (typeof func !== "undefined") {
          const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
          group.prefix && funcByName.set(`${group.prefix}.${realFuncName}`, wrappedFunc);
          group.prefixShort && funcByName.set(`${group.prefixShort}.${realFuncName}`, wrappedFunc);
          if (funcByName.has(realFuncName)) {
            ambigousNames.add(realFuncName);
          } else {
            funcByName.set(realFuncName, wrappedFunc);
          }
        }
      }
      for(const funcName of group.staticFuncs) {
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        const func = createStaticFilterFunc(group.objectClass, realFuncName);
        if (typeof func !== "undefined") {
          const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
          group.prefix && funcByName.set(`${group.prefix}.${realFuncName}`, wrappedFunc);
          group.prefixShort && funcByName.set(`${group.prefixShort}.${realFuncName}`, wrappedFunc);
          if (funcByName.has(realFuncName)) {
            ambigousNames.add(realFuncName);
          } else {
            funcByName.set(realFuncName, wrappedFunc);
          }
        }
      }
    }
    for(const funcName of defaultFilterGroup.staticFuncs) {
      const isNotNullThru = funcName.endsWith("*");
      const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
      const func = Reflect.get(DefaultFilters, funcName);
      if (typeof func === "undefined") {
        utils.raise(`${this.name}: ${funcName} is not found in defaultFilterGroup`);
      }
      const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
      funcByName.set(realFuncName, wrappedFunc);
    }
    for(const funcName of ambigousNames) {
      funcByName.delete(funcName);
    }
    this.#ambigousNames = ambigousNames;
    this.#funcByName = funcByName;
  }

  static registerFilter(funcName:string, filterFunc:FilterFuncWithOption) {
    const isNotNullThru = funcName.endsWith("*");
    const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
    if (this.#funcByName.has(realFuncName)) {
      utils.raise(`${this.name}: ${realFuncName} is already registered`);
    }
    const wrappedFunc = !isNotNullThru ? nullthru(filterFunc) : filterFunc;
    this.#funcByName.set(realFuncName, wrappedFunc);
  }

}

class InputFilters {
  static date         = (options:any[]) => (value:any):any => value === "" ? null : new Date(new Date(value).setHours(0));
  static number       = (options:any[]) => (value:any):any => value === "" ? null : Number(value);
  static boolean      = (options:any[]) => (value:any):any => (value === "false" || value === "") ? false : true;
}

export class InputFilterManager extends FilterManager {
  constructor() {
    super();
    this.ambigousNames = new Set(InputFilterManager.#ambigousNames);
    this.funcByName = new Map(InputFilterManager.#funcByName);
  }
  static #ambigousNames:Set<string> = new Set;
  static #funcByName:Map<string, FilterFuncWithOption> = new Map;
  static {
    this.#funcByName.set("date", InputFilters.date);
    this.#funcByName.set("number", InputFilters.number);
    this.#funcByName.set("boolean", InputFilters.boolean);
  }
  static registerFilter(name:string, filterFunc:FilterFuncWithOption) {
    if (this.#funcByName.has(name)) {
      utils.raise(`${this.name}: ${name} is already registered`);
    }
    this.#funcByName.set(name, filterFunc);
  }
}

class EventFilters {
  static preventDefault = (options:any[]) => (event:Event):Event => {
    event.preventDefault();
    return event;
  }
  static noStopPropagation = (options:any[]) => (event:Event):Event => {
    Reflect.set(event, "noStopPropagation", true);
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
  static #ambigousNames:Set<string> = new Set;
  static #funcByName:Map<string, EventFilterFuncWithOption> = new Map;
  static {
    this.#funcByName.set("preventDefault", EventFilters.preventDefault);
    this.#funcByName.set("noStopPropagation", EventFilters.noStopPropagation);
    this.#funcByName.set("pd", EventFilters.preventDefault);
    this.#funcByName.set("nsp", EventFilters.noStopPropagation);
  }
  static registerFilter(name:string, filterFunc:EventFilterFuncWithOption) {
    if (this.#funcByName.has(name)) {
      utils.raise(`${this.name}: ${name} is already registered`);
    }
    this.#funcByName.set(name, filterFunc);
  } 
}
