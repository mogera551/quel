/**
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyName} PropertyName
 * 
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyAccess} PropertyAccess 
 * 
 * @typedef {{html?:string,css?:string,ViewModel:class,template?:HTMLTemplateElement,extendClass?:class<HTMLElement>,extendTag?:string,componentModules:Object<string,UserComponentModule>}} UserComponentModule
 * 
 * @typedef {(value:any,options:string[])=>{return:any}} FilterFunc
 * 
 * @typedef {{input:FilterFunc,output:FilterFunc}} UserFilterData
 * 
 * @typedef {Object<string,any>} ViewModel 
 * 
 * @typedef {import("./bindInfo/BindInfo.js").BindInfo} BindInfo
 * 
 * @typedef {import("./thread/Thread.js").Thread} Thread
 * 
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlot} UpdateSlot
 * 
 * @typedef {import("./thread/ViewModelUpdator.js").ProcessData} ProcessData 
 * 
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlotStatusCallback} UpdateSlotStatusCallback
 * 
 * 
 * @typedef {import("./filter/Filter.js").Filter} Filter
 * 
 * @typedef {{
 *   propName:PropertyName,
 *   indexes:number[],
 *   pos:number,
 * }} ContextParam
 * 
 * @typedef {{indexes:number[],stack:ContextParam[]}} ContextInfo
 * 
 * @typedef {{
 *   viewModel:ViewModel,
 *   binds:BindInfo[],
 *   thread:Thread,
 *   updateSlot:UpdateSlot,
 *   props:Object<string,any>,
 *   globals:Object<string,any>,
 *   initialResolve:(...args)=>{},
 *   initialReject:()=>{},
 *   initialPromise:Promise,
 *   aliveResolve:(...args)=>{},
 *   aliveReject:()=>{},
 *   alivePromise:Promise,
 *   parentComponent:Component,
 *   withShadowRoot:boolean,
 *   viewRootElement:ShadowRoot|HTMLElement,
 *   initialize:()=>{},
 *   build:()=>{},
 *   connectedCallback:()=>{},
 *   disconnectedCallback:()=>{},
 *   applyToNode:(setOfViewModelPropertyKeys:Set<String>)=>{},
 *   initialize:()=>{},
 *   filters:{
 *     in:Object<string,FilterFunc>,
 *     out:Object<string,FilterFunc>,
 *   },
 *   static ViewModel:class<ViewModel>,
 *   static template:HTMLTemplateElement,
 *   static extendClass:class<HTMLElement>,
 *   static extendTag:string,
 *   static inputFilters:Object<string,FilterFunc>,
 *   static outputFilters:Object<string,FilterFunc>,
 * }} Component
 * 
 */

window.elapsedTimes = {};

class utils {
  /**
   * 
   * @param {string} message 
   */
  static raise(message) {
    throw new Error(message);
  }

  /**
   * 関数かどうかをチェック
   * @param {any} obj 
   * @returns {boolean}
   */
  static isFunction = (obj) => {
    const toString = Object.prototype.toString;
    const text = toString.call(obj).slice(8, -1).toLowerCase();
    return (text === "function" || text === "asyncfunction");
  }

  /**
   * 
   * @param {HTMLElement} element 
   * @returns {boolean}
   */
  static isInputableElement(element) {
    return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || 
      (element instanceof HTMLInputElement && element.type !== "button");
  }

  /**
   * to kebab case (upper camel, lower camel, snakeを想定)
   * @param {string} text 
   * @returns {string}
   */
  static toKebabCase = text => (typeof text === "string") ? text.replaceAll(/_/g, "-").replaceAll(/([A-Z])/g, (match,char,index) => (index > 0 ? "-" : "") + char.toLowerCase()) : text;

  /**
   * @returns {string}
   */
  static createUUID() {
    return window?.crypto?.randomUUID ? window.crypto.randomUUID()
     : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
        let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }
}

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const num = (v, o, fn) => {
  if (v == null) return v;
  const n = Number(v);
  return isNaN(n) ? v : fn(n, o);
};

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const str = (v, o, fn) => {
  return (v == null) ? v : fn(String(v), o);
};

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const arr = (v, o, fn) => {
  return !Array.isArray(v) ? v : fn(v, o);
};

class outputFilters {
  static styleDisplay = (value, options) => value ? (options[0] ?? "") : "none";
  static truthy       = (value, options) => value ? true : false;
  static falsey       = (value, options) => !value ? true : false;
  static not          = this.falsey;
  static eq           = (value, options) => value == options[0];
  static ne           = (value, options) => value != options[0];
  static lt           = (value, options) => Number(value) < Number(options[0]);
  static le           = (value, options) => Number(value) <= Number(options[0]);
  static gt           = (value, options) => Number(value) > Number(options[0]);
  static ge           = (value, options) => Number(value) >= Number(options[0]);
  static embed        = (value, options) => (value != null) ? decodeURIComponent((options[0] ?? "").replaceAll("%s", value)) : null;
  static ifText       = (value, options) => value ? options[0] ?? null : options[1] ?? null;
  static null         = (value, options) => (value == null) ? true : false;
  static offset       = (value, options) => Number(value) + Number(options[0]);
  static unit         = (value, options) => String(value) + String(options[0]);
  static inc          = this.offset;
  static mul          = (value, options) => Number(value) * Number(options[0]);
  static div          = (value, options) => Number(value) / Number(options[0]);
  static mod          = (value, options) => Number(value) % Number(options[0]);

  static "str.at"      = (value, options) => str(value, options, (s, o) => s.at(...o));
  static "str.charAt"  = (value, options) => str(value, options, (s, o) => s.charAt(...o));
  static "str.charCodeAt"    = (value, options) => str(value, options, (s, o) => s.charCodeAt(...o));
  static "str.codePointAt"   = (value, options) => str(value, options, (s, o) => s.codePointAt(...o));
  static "str.concat"  = (value, options) => str(value, options, (s, o) => s.concat(...o));
  static "str.endsWith"      = (value, options) => str(value, options, (s, o) => s.endsWith(...o));
  static "str.includes" = (value, options) => str(value, options, (s, o) => s.includes(...o));
  static "str.indexOf"  = (value, options) => str(value, options, (s, o) => s.indexOf(...o));
//  static isWellFormed  = (value, options) => str(value, options, (s, o) => s.isWellFormed());
  static "str.lastIndexOf" = (value, options) => str(value, options, (s, o) => s.lastIndexOf(...o));
  static "str.localeCompare" = (value, options) => str(value, options, (s, o) => s.localeCompare(...o));
  static "str.match"         = (value, options) => str(value, options, (s, o) => s.match(...o));
//  static "str.matchAll"      = (value, options) => str(value, options, (s, o) => s.matchAll(...o));
  static "str.normalize"     = (value, options) => str(value, options, (s, o) => s.normalize(...o));
  static "str.padEnd"        = (value, options) => str(value, options, (s, o) => s.padEnd(...o));
  static "str.padStart"      = (value, options) => str(value, options, (s, o) => s.padStart(...o));
  static "str.repeat"        = (value, options) => str(value, options, (s, o) => s.repeat(...o));
  static "str.replace"       = (value, options) => str(value, options, (s, o) => s.replace(...o));
  static "str.replaceAll"    = (value, options) => str(value, options, (s, o) => s.replaceAll(...o));
  static "str.search"        = (value, options) => str(value, options, (s, o) => s.search(...o));
  static "str.slice"   = (value, options) => str(value, options, (s, o) => s.slice(...o));
  static "str.split"         = (value, options) => str(value, options, (s, o) => s.split(...o));
  static "str.startsWith"    = (value, options) => str(value, options, (s, o) => s.startsWith(...o));
  static "str.substring"     = (value, options) => str(value, options, (s, o) => s.substring(...o));
  static "str.toLocaleLowerCase" = (value, options) => str(value, options, (s, o) => s.toLocaleLowerCase(...o));
  static "str.toLocaleUpperCase" = (value, options) => str(value, options, (s, o) => s.toLocaleUpperCase(...o));
  static "str.toLowerCase"   = (value, options) => str(value, options, (s, o) => s.toLowerCase(...o));
  static "str.toUpperCase"   = (value, options) => str(value, options, (s, o) => s.toUpperCase(...o));
  //static "str.toWellFormed"  = (value, options) => str(value, options, (s, o) => s.toWellFormed(...o));
  static "str.trim"          = (value, options) => str(value, options, (s, o) => s.trim(...o));
  static "str.trimEnd"       = (value, options) => str(value, options, (s, o) => s.trimEnd(...o));
  static "str.trimStart"     = (value, options) => str(value, options, (s, o) => s.trimStart(...o));

  static "num.toExponential" = (value, options) => num(value, options, (n, o) => n.toExponential(...o));
  static "num.toFixed"       = (value, options) => num(value, options, (n, o) => n.toFixed(...o));
  static "num.toLocaleString" = (value, options) => num(value, options, (n, o) => n.toLocaleString(...o));
  static "num.toPrecision"   = (value, options) => num(value, options, (n, o) => n.toPrecision(...o));
  
  static "arr.at"       = (value, options) => arr(value, options, (a, o) => a.at(...o));
  static "arr.concat"   = (value, options) => arr(value, options, (a, o) => a.concat(...o));
  static "arr.entries"  = (value, options) => arr(value, options, (a, o) => a.entries(...o));
  static "arr.flat"     = (value, options) => arr(value, options, (a, o) => a.flat(...o));
  static "arr.includes" = (value, options) => arr(value, options, (a, o) => a.includes(...o));
  static "arr.indexOf"  = (value, options) => arr(value, options, (a, o) => a.indexOf(...o));
  static "arr.join"     = (value, options) => arr(value, options, (a, o) => a.join(...o));
  static "arr.keys"     = (value, options) => arr(value, options, (a, o) => a.keys(...o));
  static "arr.lastIndexOf"    = (value, options) => arr(value, options, (a, o) => a.lastIndexOf(...o));
  static "arr.slice"    = (value, options) => arr(value, options, (a, o) => a.slice(...o));
  static "arr.toLocaleString" = (value, options) => arr(value, options, (a, o) => a.toLocaleString(...o));
  static "arr.toReversed"     = (value, options) => arr(value, options, (a, o) => a.toReversed(...o));
  static "arr.toSorted"       = (value, options) => arr(value, options, (a, o) => a.toSorted(...o));
  static "arr.toSpliced"      = (value, options) => arr(value, options, (a, o) => a.toSpliced(...o));
  static "arr.values"   = (value, options) => arr(value, options, (a, o) => a.values(...o));
  static "arr.with"     = (value, options) => arr(value, options, (a, o) => a.with(...o));

  static get at() {
    return (value, options) => (Array.isArray(value) ? this["arr.at"] : this["str.at"])(value, options);
  }
  static get charAt() {
    return this["str.charAt"];
  }
  static get charCodeAt() {
    return this["str.charCodeAt"];
  }
  static get codePointAt() {
    return this["str.codePointAt"];
  }
  static get concat() {
    return (value, options) => (Array.isArray(value) ? this["arr.concat"] : this["str.concat"])(value, options);
  }
  static get endsWith() {
    return this["str.endsWith"];
  }
  static get entries() {
    return this["arr.entries"];
  }
  static get flat() {
    return this["arr.flat"];
  }
  static get includes() {
    return (value, options) => (Array.isArray(value) ? this["arr.includes"] : this["str.includes"])(value, options);
  }
  static get indexOf() {
    return (value, options) => (Array.isArray(value) ? this["arr.indexOf"] : this["str.indexOf"])(value, options);
  }
  static get join() {
    return this["arr.join"];
  }
  static get keys() {
    return this["arr.keys"];
  }
  static get lastIndexOf() {
    return (value, options) => (Array.isArray(value) ? this["arr.lastIndexOf"] : this["str.lastIndexOf"])(value, options);
  }
  static get localeCompare() {
    return this["str.localeCompare"];
  }
  static get match() {
    return this["str.match"];
  }
  //static get matchAll() {
  //  return this["str.matchAll"];
  //}
  static get normalize() {
    return this["str.normalize"];
  }
  static get padEnd() {
    return this["str.padEnd"];
  }
  static get padStart() {
    return this["str.padStart"];
  }
  static get repeat() {
    return this["str.repeat"];
  }
  static get replace() {
    return this["str.replace"];
  }
  static get replaceAll() {
    return this["str.replaceAll"];
  }
  static get search() {
    return this["str.search"];
  }
  static get slice() {
    return (value, options) => (Array.isArray(value) ? this["arr.slice"] : this["str.slice"])(value, options);
  }
  static get split() {
    return this["str.split"];
  }
  static get startsWith() {
    return this["str.startsWith"];
  }
  static get substring() {
    return this["str.substring"];
  }
  static get toExponential() {
    return this["num.toExponential"];
  }
  static get toFixed() {
    return this["num.toFixed"];
  }
  static get toLocaleString() {
    return (value, options) => (Array.isArray(value) ? this["arr.toLocaleString"] : this["num.toLocaleString"])(value, options);
  }
  static get toLocaleLowerCase() {
    return this["str.toLocaleLowerCase"];
  }
  static get toLocaleUpperCase() {
    return this["str.toLocaleUpperCase"];
  }
  static get toLowerCase() {
    return this["str.toLowerCase"];
  }
  static get toPrecision() {
    return this["num.toPrecision"];
  }
  static get toReversed() {
    return this["arr.toReversed"];
  }
  static get toSorted() {
    return this["arr.toSorted"];
  }
  static get toSpliced() {
    return this["arr.toSpliced"];
  }
  static get toUpperCase() {
    return this["str.toUpperCase"];
  }
  //static get toWellFormed() {
  //  return this["str.toWellFormed"];
  //}
  static get trim() {
    return this["str.trim"];
  }
  static get trimEnd() {
    return this["str.trimEnd"];
  }
  static get trimStart() {
    return this["str.trimStart"];
  }
  static get values() {
    return this["arr.values"];
  }
  static get with() {
    return this["arr.with"];
  }

}

class inputFilters {
  static number       = (value, options) => value === "" ? null : Number(value);
  static boolean      = (value, options) => value === "" ? null : Boolean(value);
}

// "property:vmProperty|toFix,2|toLocaleString;"
// => toFix,2|toLocaleString

class Filter {
  /** @type {string} */
  name;

  /** @type {string[]} */
  options;

  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   * @returns {any}
   */
  static applyForInput(value, filters, inputFilterFuncs) {
    return filters.reduceRight((v, f) => (f.name in inputFilterFuncs) ? inputFilterFuncs[f.name](v, f.options) : v, value);
  }
  
  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} outputFilterFuncs
   * @returns {any}
   */
  static applyForOutput(value, filters, outputFilterFuncs) {
    return filters.reduce((v, f) => (f.name in outputFilterFuncs) ? outputFilterFuncs[f.name](v, f.options) : v, value);
  }

  /**
   * 
   * @param {string} name 
   * @param {(value:any,options:string[])=>{}} outputFilter 
   * @param {(value:any,options:string[])=>{}} inputFilter 
   */
  static regist(name, outputFilter, inputFilter) {
    if (name in outputFilters) utils.raise(`regist filter error duplicate name (${name})`);
    if (name in inputFilters) utils.raise(`regist filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
  }
}

/** @enum {number} */
const NodePropertyType = {
//  levelTop: 1,
//  level2nd: 2,
//  level3rd: 3,
  text: 1,
  property: 10,
  attribute: 20,
  style: 21,
  classList: 22,
  className: 23,
  radio: 30,
  checkbox: 40,
  event: 91,
  component: 92,
  template: 95,
};

/** @type {string} */
const TEMPLATE_BRANCH = "if"; // 条件分岐
/** @type {string} */
const TEMPLATE_REPEAT = "loop"; // 繰り返し

const name = "quel";

const WILDCARD = "*";
const DELIMITER$1 = ".";
const SYM_PREFIX = "dot-notation"; // + Math.trunc(Math.random() * 9999_9999);
const SYM_DIRECT_GET = Symbol.for(SYM_PREFIX + ".direct_get");
const SYM_DIRECT_SET = Symbol.for(SYM_PREFIX + ".direct_set");
const SYM_IS_SUPPORT_DOT_NOTATION = Symbol.for(SYM_PREFIX + ".is_support_dot_notation");

/**
 * @enum {Symbol}
 */
const Symbols$1 = {
  directlyGet: SYM_DIRECT_GET,
  directlySet: SYM_DIRECT_SET,
  isSupportDotNotation: SYM_IS_SUPPORT_DOT_NOTATION,
};

const RE_CONTEXT_INDEX = new RegExp(/^\$([0-9]+)$/);

class PropertyName {
  /**
   * @type {string}
   */
  name;
  /**
   * @type {string[]}
   */
  pathNames = [];
  /**
   * @type {string[]}
   */
  parentPathNames = [];
  /**
   * @type {string}
   */
  parentPath;
  /**
   * @type {string[]}
   */
  parentPaths = [];
  /**
   * @type {Set<string>}
   */
  setOfParentPaths;
  /**
   * @type {RegExp}
   */
  regexp;
  /**
   * @type {number}
   */
  level = 0;
  /**
   * @type {boolean}
   */
  isPrimitive;

  /**
   * 
   * @param {string} name 
   */
  constructor(name) {
    this.name = name;
    this.pathNames = name.split(DELIMITER$1);
    this.parentPathNames = this.pathNames.slice(0, -1);
    this.parentPaths = this.parentPathNames.reduce((paths, pathName) => { 
      paths.push(paths.at(-1)?.concat(pathName) ?? [pathName]);
      return paths;
    }, []).map(paths => paths.join("."));
    this.setOfParentPaths = new Set(this.parentPaths);
    this.parentPath = this.parentPathNames.join(DELIMITER$1);
    this.lastPathName = this.pathNames.at(-1);
    this.regexp = new RegExp("^" + name.replaceAll(".", "\\.").replaceAll("*", "([0-9a-zA-Z_]*)") + "$");
    this.level = this.pathNames.filter(pathName => pathName === WILDCARD).length;
    this.isPrimitive = (this.pathNames.length === 1);
    this.nearestWildcardName = undefined;
    this.nearestWildcardParentName = undefined;
    if (this.level > 0) {
      for(let i = this.pathNames.length - 1; i >= 0; i--) {
        if (this.pathNames[i] === WILDCARD) {
          this.nearestWildcardName = this.pathNames.slice(0, i + 1).join(".");
          this.nearestWildcardParentName = this.pathNames.slice(0, i).join(".");
          break;
        }
      }
    }
  }

  /**
   * 
   * @param {string} name 
   * @returns {PropertyName}
   */
  static create(name) {
    const propertyName = this.propertyNameByName.get(name);
    if (propertyName) return propertyName;
    const newPropertyName = new PropertyName(name);
    this.propertyNameByName.set(name, newPropertyName);
    return newPropertyName;
  }
  /**
   * @type {Map<string,PropertyName>}
   */
  static propertyNameByName = new Map;

  /**
   * 
   * @param {*} prop 
   * @returns {PropertyAccess}
   */
  static parse(prop) {
    const indexes = [];
    const patternPropElements = [];
    for(const propElement of prop.split(".")) {
      const index = Number(propElement);
      if (isNaN(index)) {
        patternPropElements.push(propElement);
      } else {
        indexes.push(index);
        patternPropElements.push("*");
      }
    }
    return { 
      propName: PropertyName.create(patternPropElements.join(".")),
      indexes
    };
  }
}

/**
 * @typedef {{propName:PropertyName,indexes:number[]}} PropertyAccess
 */

let Handler$2 = class Handler {
  /**
   * @type {number[][]}
   */
  #stackIndexes = [];
  /**
   * @type {Map<string,PropertyAccess>}
   */
  #matchByName = new Map;

  get lastIndexes() {
    return this.#stackIndexes[this.#stackIndexes.length - 1];
  }

  get stackIndexes() {
    return this.#stackIndexes;
  }

  /**
   * @type {Map<string,PropertyAccess>}
   */
  get matchByName() {
    return this.#matchByName;
  }

  /**
   * 
   * @param {any} target 
   * @param {{propName:PropertyName}}  
   * @param {Proxy} receiver
   * @returns {any}
   */
  getByPropertyName(target, { propName }, receiver) {
    let value = undefined;
    if (Reflect.has(target, propName.name)) {
      value = Reflect.get(target, propName.name, receiver);
    } else {
      if (propName.parentPath !== "") {
        const parentPropName = PropertyName.create(propName.parentPath);
        const parent = this.getByPropertyName(target, { propName:parentPropName }, receiver);
        if (typeof parent !== "undefined") {
          const lastName = (propName.lastPathName === WILDCARD) ? this.lastIndexes[propName.level - 1] : propName.lastPathName;
          value = Reflect.get(parent, lastName);
        }
      }
    }
    return value;
  }

  /**
   * 
   * @param {any} target 
   * @param {{propName:PropertyName,value:any}}  
   * @param {Proxy} receiver
   * @returns {boolean}
   */
  setByPropertyName(target, { propName, value }, receiver) {
    let result = false;
    if (Reflect.has(target, propName.name) || propName.isPrimitive) {
      result = Reflect.set(target, propName.name, value, receiver);
    } else {
      const parentPropName = PropertyName.create(propName.parentPath);
      const parent = this.getByPropertyName(target, { propName:parentPropName }, receiver);
      if (typeof parent !== "undefined") {
        const lastName = (propName.lastPathName === WILDCARD) ? this.lastIndexes[propName.level - 1] : propName.lastPathName;
        result = Reflect.set(parent, lastName, value);
      }
    }
    return result;
  }

  /**
   * 
   * @param {number[]} indexes 
   * @param {()=>{}} callback 
   * @returns 
   */
  pushIndexes(indexes, callback) {
    this.#stackIndexes.push(indexes);
    try {
      return Reflect.apply(callback, this, []);
    } finally {
      this.#stackIndexes.pop();
    }
  }

  /**
   * 
   * @param {any} target 
   * @param {Proxy} receiver 
   * @returns {({}:PropertyAccess) => {any}  }
   */
  getFunc = (target, receiver) => ({propName, indexes}) => 
    this.pushIndexes(indexes, () => this.getByPropertyName(target, { propName }, receiver));

  /**
   * 
   * @param {any} target 
   * @param {Proxy} receiver 
   * @returns {({}:PropertyAccess, value:any) => {boolean}  }
   */
  setFunc = (target, receiver) => ({propName, indexes}, value) => 
    this.pushIndexes(indexes, () => this.setByPropertyName(target, { propName, value }, receiver));

  /**
   * 
   * @param {any} target
   * @param {{propName:PropertyName,indexes:number[]}} 
   * @param {Proxy} receiver
   * @returns {any[]}
   */
  getExpandLastLevel(target, { propName, indexes }, receiver) {
    const getFunc = this.getFunc(target, receiver);
    if (typeof propName.nearestWildcardName === "undefined") throw new Error(`not found wildcard path of '${propName.name}'`);
    const listProp = PropertyName.create(propName.nearestWildcardParentName);
    return getFunc({propName:listProp, indexes}).map((value, index) => getFunc({propName, indexes:indexes.concat(index)}));
  }

  /**
   * 
   * @param {any} target
   * @param {{propName:PropertyName,indexes:number[],values:any[]}}  
   * @param {Proxy} receiver
   * @returns {boolean}
   */
  setExpandLastLevel(target, { propName, indexes, values }, receiver) {
    const getFunc = this.getFunc(target, receiver);
    const setFunc = this.setFunc(target, receiver);
    if (typeof propName.nearestWildcardName === "undefined") throw new Error(`not found wildcard path of '${propName.name}'`);
    const listProp = PropertyName.create(propName.nearestWildcardParentName);
    const listValues = getFunc({propName:listProp, indexes});
    const newValues = Array.isArray(values) ? values : [...Array(listValues.length)].map(v => values);
    if (propName.nearestWildcardName === propName.name) {
      // propName末尾が*の場合
      setFunc({propName:listProp, indexes}, newValues);
    } else {
      if (newValues.length !== listValues.length) throw new Error(`not match array count '${propName.name}'`);
      for(let i in listValues) {
        setFunc({propName, indexes:indexes.concat(Number(i))}, newValues[i]);
      }
    }
    return true;
  }
  
  /**
   * 
   * @param {any} target 
   * @param {{prop:string,indexes:number[]}} 
   * @param {Proxy<>} receiver 
   * @returns {any}
   */
  [Symbols$1.directlyGet](target, {prop, indexes}, receiver) {
    const propName = PropertyName.create(prop);
    return this.pushIndexes(indexes, () => this.getByPropertyName(target, { propName }, receiver));
  }

  /**
   * 
   * @param {any} target 
   * @param {{prop:string,indexes:number[],value:any}} 
   * @param {Proxy<>} receiver 
   * @returns {boolean}
   */
  [Symbols$1.directlySet](target, {prop, indexes, value}, receiver) {
    const propName = PropertyName.create(prop);
    return this.pushIndexes(indexes, () => this.setByPropertyName(target, { propName, value }, receiver));
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy} receiver 
   * @returns {any}
   */
  get(target, prop, receiver) {
    const isPropString = typeof prop === "string";
    if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) {
      return Reflect.get(target, prop, receiver);
    }
    const getFunc = this.getFunc(target, receiver);
    const lastIndexes = this.lastIndexes;
    let match;
    if (prop === Symbols$1.directlyGet) {
      // プロパティとindexesを直接指定してgetする
      return (prop, indexes) => 
        Reflect.apply(this[Symbols$1.directlyGet], this, [target, { prop, indexes }, receiver]);
    } else if (prop === Symbols$1.directlySet) {
      // プロパティとindexesを直接指定してsetする
      return (prop, indexes, value) => 
        Reflect.apply(this[Symbols$1.directlySet], this, [target, { prop, indexes, value }, receiver]);
    } else if (prop === Symbols$1.isSupportDotNotation) {
      return true;
    } else if (isPropString) {
      if (match = RE_CONTEXT_INDEX.exec(prop)) {
        // $数字のプロパティ
        // indexesへのアクセス
        return lastIndexes?.[Number(match[1]) - 1] ?? undefined;
      //} else if (prop.at(0) === "@" && prop.at(1) === "@") {
      } else if (prop.at(0) === "@") {
        const name = prop.slice(1);
        const propName = PropertyName.create(name);
        if (((lastIndexes?.length ?? 0) + 1) < propName.level) throw new Error(`array level not match`);
        const baseIndexes = lastIndexes?.slice(0, propName.level - 1) ?? [];
        return this.getExpandLastLevel(target, { propName, indexes:baseIndexes }, receiver);
      }
      if (this.#matchByName.has(prop)) {
        return getFunc(this.#matchByName.get(prop));
      }
      const propAccess = PropertyName.parse(prop);
      if (propAccess.propName.level === propAccess.indexes.length) {
        this.#matchByName.set(prop, propAccess);
      }
      return getFunc({
        propName:propAccess.propName,
        indexes:propAccess.indexes.concat(lastIndexes?.slice(propAccess.indexes.length) ?? [])
      });
    } else {
      return Reflect.get(target, prop, receiver);
    }
  }

  /**
   * 
   * @param {object} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   */
  set(target, prop, value, receiver) {
    const isPropString = typeof prop === "string";
    if (isPropString) {
      if (prop.startsWith("@@__") || prop === "constructor") {
        return Reflect.set(target, prop, value, receiver);
      }
      const setFunc = this.setFunc(target, receiver);
      const lastIndexes = this.lastIndexes;
      if (prop.at(0) === "@") {
        const name = prop.slice(1);
        const propName = PropertyName.create(name);
        if (((this.lastIndexes?.length ?? 0) + 1) < propName.level) throw new Error(`array level not match`);
        const baseIndexes = this.lastIndexes?.slice(0, propName.level - 1) ?? [];
        return this.setExpandLastLevel(target, { propName, indexes:baseIndexes, values:value }, receiver);
      }
      if (this.#matchByName.has(prop)) {
        return setFunc(this.#matchByName.get(prop), value);
      }
      const propAccess = PropertyName.parse(prop);
      if (propAccess.propName.level === propAccess.indexes.length) {
        this.#matchByName.set(prop, propAccess);
      }
      return setFunc({
        propName:propAccess.propName,
        indexes:propAccess.indexes.concat(lastIndexes?.slice(propAccess.indexes.length) ?? [])
      }, value);
    } else {
      return Reflect.set(target, prop, value, receiver);
    }
 }
};

/**
 * @enum {Symbol}
 */
const Symbols = Object.assign({
  connectedCallback: Symbol.for(`${name}:viewModel.connectedCallback`),
  disconnectedCallback: Symbol.for(`${name}:viewModel.disconnectedCallback`),
  initCallback: Symbol.for(`${name}:viewModel.initCallback`),
  writeCallback: Symbol.for(`${name}:viewModel.writeCallback`),
  getDependentProps: Symbol.for(`${name}:viewModel.getDependentProps`),
  getHandler: Symbol.for(`${name}:viewModel.getHandler`),
  addNotify: Symbol.for(`${name}:viewModel.addNotify`),

  beCacheable: Symbol.for(`${name}:viewModel.beCacheable`),
  beUncacheable: Symbol.for(`${name}:viewModel.beUncacheable`),

  boundByComponent: Symbol.for(`${name}:globalData.boundByComponent`),

  directlyCall: Symbol.for(`${name}:viewModel.directCall`),
  bindTo: Symbol.for(`${name}:componentModule.bindTo`),
  notifyForDependentProps: Symbol.for(`${name}:viewModel.notifyForDependentProps`),

  bindProperty: Symbol.for(`${name}:props.bindProperty`),
  toObject: Symbol.for(`${name}:props.toObject`),

  isComponent: Symbol.for(`${name}:component.isComponent`),
}, Symbols$1);

const PREFIX_EVENT = "on";
const DEFAULT_TEXT_PROPERTY = "textContent";
const PROPS_PROPERTY$1 = "props";

class NodePropertyInfo {
  /** @type {NodePropertyType} */
  type;

  /** @type {string[]} */
  nodePropertyElements = [];

  /** @type {string} */
  eventType;

  /** @type {Object<string,NodePropertyInfo>} */
  static nodePropertyInfoByKey = {};

  /**
   * ノードからノードプロパティ情報を取得
   * @param {Node} node
   * @param {string} nodeProperty 
   * @returns {NodePropertyInfo}
   */
  static get(node, nodeProperty) {
    const result = new NodePropertyInfo;
    const key = `${node.constructor.name}\t${node.textContent[2]}\t${node[Symbols.isComponent]}\t${nodeProperty}`;
    const nodePropertyInfo = this.nodePropertyInfoByKey[key];
    if (typeof nodePropertyInfo !== "undefined") {
      result.type = nodePropertyInfo.type;
      result.nodePropertyElements = nodePropertyInfo.nodePropertyElements.slice(0);
      result.eventType = nodePropertyInfo.eventType;
      return result;
    }
    do {
      result.nodePropertyElements = nodeProperty.split(".");
      if (node instanceof Comment && node.textContent[2] === "|") {
        if (nodeProperty === TEMPLATE_BRANCH || nodeProperty === TEMPLATE_REPEAT) {
          result.type = NodePropertyType.template;
          break;
        } else {
          utils.raise(`template illegal property ${nodeProperty}`);
        }
      }      
      if (node[Symbols.isComponent] && result.nodePropertyElements[0] === PROPS_PROPERTY$1) { 
        result.type = NodePropertyType.component;
        break;
      }      if ((node instanceof HTMLElement) || (node instanceof SVGElement)) {
        if (result.nodePropertyElements.length === 1) {
          if (result.nodePropertyElements[0].startsWith(PREFIX_EVENT)) {
            result.type = NodePropertyType.event;
            result.eventType = result.nodePropertyElements[0].slice(PREFIX_EVENT.length);
          } else if (result.nodePropertyElements[0] === "class") {
            result.type = NodePropertyType.className;
          } else if (result.nodePropertyElements[0] === "radio") {
            result.type = NodePropertyType.radio;
          } else if (result.nodePropertyElements[0] === "checkbox") {
            result.type = NodePropertyType.checkbox;
          } else {
            result.type = NodePropertyType.property;
          }
        } else if (result.nodePropertyElements.length === 2) {
          if (result.nodePropertyElements[0] === "class") {
            result.type = NodePropertyType.classList;
          } else if (result.nodePropertyElements[0] === "style") {
            result.type = NodePropertyType.style;
          } else if (result.nodePropertyElements[0] === "attr") {
            result.type = NodePropertyType.attribute;
          } else {
            utils.raise(`unknown property ${nodeProperty}`);
          }
        } else {
          utils.raise(`unknown property ${nodeProperty}`);
        }
      } else {
        if (result.nodePropertyElements.length === 1 && result.nodePropertyElements[0] === DEFAULT_TEXT_PROPERTY) {
          result.type = NodePropertyType.text;
        } else {
          const toString = Object.prototype.toString;
          const nodeType = toString.call(node).slice(8, -1).toLowerCase();
          utils.raise(`unknown node ${nodeType} or property ${nodeProperty}`);
        }
      }
  
    } while(false);
    this.nodePropertyInfoByKey[key] = result;
    return result;
  }
}

class BindInfo {
  /** @type {Node} */
  #node;
  /** @type {Node} */
  get node() {
    return this.#node;
  }
  set node(node) {
    this.#node = node;
  }
  /** @type {Element} */
  get element() {
    return (this.node instanceof Element) ? this.node : utils.raise("not Element");
  }
  /** @type {HTMLElement} */
  get htmlElement() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /** @type {SVGElement} */
  get svgElement() {
    return (this.node instanceof SVGElement) ? this.node : utils.raise("not SVGElement");
  }

  /** @type {string} */
  #nodeProperty;
  /** @type {string} */
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(value) {
    this.#nodeProperty = value;
  }

  /** @type {string[]} */
  #nodePropertyElements;
  /** @type {string[]} */
  get nodePropertyElements() {
    return this.#nodePropertyElements;
  }
  set nodePropertyElements(value) {
    this.#nodePropertyElements = value;
  }

  /** @type {Component} */
  component;

  /** @type {ViewModel} */
  viewModel;

  /** @type {string} */
  #viewModelProperty;

  /** @type {string} */
  get viewModelProperty() {
    return this.#viewModelProperty;
  }
  set viewModelProperty(value) {
    this.#viewModelProperty = value;

    this.#viewModelPropertyName = undefined;
    this.#isContextIndex = undefined;
    this.#contextIndex = undefined;
    this.#contextParam = undefined;
  }

  /** @type {PropertyName} */
  #viewModelPropertyName;
  /** @type {PropertyName} */
  get viewModelPropertyName() {
    if (typeof this.#viewModelPropertyName === "undefined") {
      this.#viewModelPropertyName = PropertyName.create(this.#viewModelProperty);
    }
    return this.#viewModelPropertyName;
  }

  /** @type {number} */
  #contextIndex;
  /** @type {number} */
  get contextIndex() {
    if (typeof this.#contextIndex === "undefined") {
      if (this.isContextIndex === true) {
        this.#contextIndex = Number(this.viewModelProperty.slice(1)) - 1;
      }
    }
    return this.#contextIndex;
  }

  /** @type {boolean} */
  #isContextIndex;
  /** @type {boolean} */
  get isContextIndex() {
    if (typeof this.#isContextIndex === "undefined") {
      this.#isContextIndex = (RE_CONTEXT_INDEX.exec(this.viewModelProperty)) ? true : false;
    }
    return this.#isContextIndex;
  }

  /** @type {Filter[]} */
  filters;

  /** @type {ContextParam} */
  #contextParam;
  /** @type {ContextParam} */
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = this.viewModelPropertyName;
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      }
    }
    return this.#contextParam;
  }

  /** @type {number[]} */
  get indexes() {
    return this.contextParam?.indexes ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  get viewModelPropertyKey() {
    return this.viewModelProperty + "\t" + this.indexesString;
  }

  /** @type {number[]} */
  get contextIndexes() {
    return this.context.indexes;
  }
  
  /** @type {ContextInfo} */
  #context;
  /** @type {ContextInfo} */
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
    this.#contextParam = undefined;
  }

  /** @type {string} */
  eventType;
  
  /** @type {(event:Event)=>void} */
  defaultEventHandler;

  /** @type {string} */
  defaultEventType;

  /** @type {any} */
  get viewModelValue() {
    return (this.isContextIndex) ?
      this.contextIndexes[this.contextIndex] :
      this.viewModel[Symbols.directlyGet](this.viewModelProperty, this.indexes);
  }
  set viewModelValue(value) {
    if (!this.isContextIndex) {
      this.viewModel[Symbols.directlySet](this.viewModelProperty, this.indexes, value);
    }
  }

  /** @type {any} */
  get filteredViewModelValue() {
    return this.filters.length > 0 ? 
      Filter.applyForOutput(this.viewModelValue, this.filters, this.component.filters.out) : 
      this.viewModelValue;
  }
  set filteredViewModelValue(value) {
    this.viewModelValue = this.filters.length > 0 ? Filter.applyForInput(value, this.filters, this.component.filters.in) : value;
  }

  /** @type {any} */
  get nodeValue() {

  }
  set nodeValue(value) {
    
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {}

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {}

  /**
   * ToDo:名前を変えたほうが良い
   */
  removeFromParent() {}
}

/** @enum {number} */
const UpdateSlotStatus = {
  beginViewModelUpdate: 1,
  endViewMmodelUpdate: 2,
  beginNotifyReceive: 3,
  endNotifyReceive: 4,
  beginNodeUpdate: 5,
  endNodeUpdate: 6,
};

class NodeUpdateData {
  /** @type {Node} */
  node;

  /** @type {string} */
  property;

  /** @type {string} */
  viewModelProperty;

  /** @type {any} */
  value;

  /** @type {()=>void} */
  updateFunc;

  /**
   * 
   * @param {Node} node 
   * @param {string} property 
   * @param {string} viewModelProperty 
   * @param {any} value 
   * @param {()=>void} updateFunc 
   */
  constructor(node, property, viewModelProperty, value, updateFunc) {
    this.node = node;
    this.property = property;
    this.viewModelProperty = viewModelProperty;
    this.value = value;
    this.updateFunc = updateFunc;
  }
}

class NodeUpdator {
  /** @type {NodeUpdateData[]} */
  queue = [];

  /** @type {UpdateSlotStatusCallback} */
  #statusCallback;

  /** 
   * @param {UpdateSlotStatusCallback} statusCallback 
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 更新する順番を並び替える
   * HTMLTemplateElementが前
   * その次がHTMLSelectElementでないもの
   * 最後がHTMLSelectElement
   * @param {NodeUpdateData[]} updates 
   * @returns {NodeUpdateData[]}
   */
  reorder(updates) {
    updates.sort((update1, update2) => {
      if (update1.node instanceof HTMLTemplateElement && update2.node instanceof HTMLTemplateElement) return 0;
      if (update2.node instanceof HTMLTemplateElement) return 1;
      if (update1.node instanceof HTMLTemplateElement) return -1;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value" && update2.node instanceof HTMLSelectElement && update2.property === "value") return 0;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value") return 1;
      if (update2.node instanceof HTMLSelectElement && update2.property === "value") return -1;
      return 0;
    });
    return updates;
  }

  /**
   * @returns {void}
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNodeUpdate);
    try {
      while(this.queue.length > 0) {
        const updates = this.queue.splice(0);
        const orderedUpdates = this.reorder(updates);
        for(const update of orderedUpdates) {
          Reflect.apply(update.updateFunc, update, []);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNodeUpdate);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

class AttributeBind extends BindInfo {
  /** @type {string} 属性名 */
  get attrName() {
    return this.nodePropertyElements[1];
  }

  /** @type {string} nodeの値 */
  get nodeValue() {
    return this.element.getAttribute(this.attrName);
  }
  set nodeValue(value) {
    this.element.setAttribute(this.attrName, value);
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, attrName, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }

}

class ClassListBind extends BindInfo {
  /** @type {string} */
  get className() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, nodeProperty, viewModelProperty, className, filteredViewModelValue} = this;
    const hasClassName = element.classList.contains(className);
    if (filteredViewModelValue !== hasClassName) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredViewModelValue, () => {
        filteredViewModelValue ? element.classList.add(className) : element.classList.remove(className);
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.element.classList.contains(this.className);
  }
}

const CLASS_PROPERTY = "className";
const DELIMITER = " ";

class ClassNameBind extends BindInfo {
  /** @type {string} */
  get nodeValue() {
    return this.element[CLASS_PROPERTY];
  }
  set nodeValue(value) {
    this.element[CLASS_PROPERTY] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    const joinedValue = filteredViewModelValue.join(DELIMITER);
    if (this.nodeValue !== joinedValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = joinedValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue ? this.nodeValue.split(DELIMITER) : [];
  }
}

const toHTMLInputElement$1 = node => (node instanceof HTMLInputElement) ? node : utils.raise();

class Radio extends BindInfo {
  /** @type {HTMLInputElement} */
  get radio() {
    const input = toHTMLInputElement$1(this.element);
    return input["type"] === "radio" ? input : utils.raise('not radio');
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, radio, nodeProperty, viewModelProperty, filteredViewModelValue} = this;
    const checked = filteredViewModelValue === radio.value;
    if (radio.checked !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredViewModelValue, () => {
        radio.checked = checked;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    if (this.radio.checked) {
      this.filteredViewModelValue = this.radio.value;
    }
  }
}

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise('not HTMLInputElement');

class Checkbox extends BindInfo {
  /** @type {HTMLInputElement} */
  get checkbox() {
    const input = toHTMLInputElement(this.element);
    return input["type"] === "checkbox" ? input : utils.raise('not checkbox');
  }

  /** @type {boolean} */
  get nodeValue() {
    return this.checkbox.checked;
  }
  set nodeValue(value) {
    this.checkbox.checked = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, checkbox, nodeProperty, viewModelProperty, filteredViewModelValue} = this;
    const checked = typeof filteredViewModelValue.find(value => value === checkbox.value) !== "undefined";
    if (this.nodeValue !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = checked;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, nodeValue, filters, checkbox, viewModelValue} = this;
    /** @type {string} */
    const checkboxValue = Filter.applyForInput(checkbox.value, filters, component.filters.in);
    /** @type {Set<string>} */
    const setOfValue = new Set(viewModelValue);
    nodeValue ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    this.viewModelValue = value;
  }
}

class Context {

  /**
   * 空のコンテクスト情報を生成
   * @returns {ContextInfo}
   */
  static create() {
    return {
      indexes: [],
      stack: [],
    }
  }

  /**
   * コンテクスト情報をクローン
   * @param {ContextInfo} src 
   * @returns {ContextInfo}
   */
  static clone(src) {
    /**
     * @type {ContextInfo}
     */
    const dst = this.create();
    dst.indexes = src.indexes.slice();
    for(const srcParam of src.stack) {
      /**
       * @type {ContextParam}
       */
      const dstParam = {};
      dstParam.indexes = srcParam.indexes.slice();
      dstParam.pos = srcParam.pos;
      dstParam.propName = srcParam.propName;
      dst.stack.push(dstParam);
    }
    return dst;
  }
}

class Templates {
  /** @type {Map<string,HTMLTemplateElement>} */
  static templateByUUID = new Map;

}

class TemplateChild {
  /** @type {BindInfo[]} */
  binds;

  /** @type {Node[]} */
  childNodes;

  /** @type {DocumentFragment} */
  fragment;

  /** @type {ContextInfo} */
  context;

  /** @type {string} */
  uuid;

  /** @type {Node} */
  get lastNode() {
    return this.childNodes[this.childNodes.length - 1];
  }

  /** @type {node[]|DocumentFragment} */
  get nodesForAppend() {
    return this.fragment.childNodes.length > 0 ? [this.fragment] : this.childNodes;
  }

  /**
   * 
   */
  removeFromParent() {
    this.childNodes.forEach(node => this.fragment.appendChild(node));
    this.binds.forEach(bind => bind.removeFromParent());
  }

  /**
   * 
   */
  updateNode() {
    this.binds.forEach(bind => {
      bind.updateNode();
    });
  }

  /**
   * 
   * @param {TemplateBind} templateBind 
   * @param {ContextInfo} context
   * @returns {TemplateChild}
   */
  static create(templateBind, context) {
    const { component, template, uuid } = templateBind;
    const templateChildren = this.templateChildrenByUUID.get(uuid);
    if (typeof templateChildren === "undefined" || templateChildren.length === 0) {
      const { binds, content } = ViewTemplate.render(component, template, context);
      const childNodes = Array.from(content.childNodes);
      return Object.assign(new TemplateChild, { binds, childNodes, fragment:content, context, uuid });
    } else {
      const templateChild = templateChildren.pop();
      templateChild.binds.forEach(bind => {
        bind.context = context;
        bind.updateNode();
      });
      return templateChild;
    }
  }

  /** @type {Map<string,TemplateChild[]>} */
  static templateChildrenByUUID = new Map;

  /**
   * 削除したTemplateChildを再利用のため保存しておく
   * @param {TemplateChild} templateChild 
   */
  static dispose(templateChild) {
    const children = this.templateChildrenByUUID.get(templateChild.uuid);
    if (typeof children === "undefined") {
      this.templateChildrenByUUID.set(templateChild.uuid, [templateChild]);
    } else {
      children.push(templateChild);
    }
  }
}

class TemplateBind extends BindInfo {
  /** @type {TemplateChild[]} */
  templateChildren = [];

  /** @type {HTMLTemplateElement} */
  #template;
  /** @type {HTMLTemplateElement} */
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Templates.templateByUUID.get(this.uuid);
    }
    return this.#template;
  }

  /** @type {string} */
  #uuid;
  /** @type {string} */
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = this.node.textContent.slice(3);
    }
    return this.#uuid;
  }

  /** @type {number} */
  #lastCount;
  /** @type {number} */
  get lastCount() {
    return (this.#lastCount ?? 0);
  }
  set lastCount(v) {
    this.#lastCount = v;
  }

  /** @type {TemplateChild | undefined} */
  get lastChild() {
    return this.templateChildren[this.templateChildren.length - 1];
  }

  updateNode() {
    (this.nodeProperty === TEMPLATE_REPEAT) ? this.expandLoop() : 
      (this.nodeProperty === TEMPLATE_BRANCH) ? this.expandIf() : utils.raise(`unknown property ${this.nodeProperty}`);
  }

  removeFromParent() {
    this.templateChildren.forEach(templateChild => {
      templateChild.removeFromParent();
      TemplateChild.dispose(templateChild);
    });
    this.templateChildren = [];
    this.lastCount = 0;
  }

  /**
   * 
   * @returns {void}
   */
  expandIf() {
    const { component, filters, context, filteredViewModelValue } = this;
    const currentValue = this.templateChildren.length > 0;
    if (currentValue !== filteredViewModelValue) {
      if (filteredViewModelValue) {
        const newTemplateChildren = [TemplateChild.create(this, Context.clone(context))];
        TemplateBind.appendToParent(this.lastChild?.lastNode ?? this.node, newTemplateChildren);
        this.templateChildren = newTemplateChildren;
      } else {
        TemplateBind.removeFromParent(this.templateChildren);
        this.templateChildren = [];
      }
    } else {
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    }
  }

  /**
   * @returns {void}
   */
  expandLoop() {
    const { component, filters, context, viewModelValue } = this;
    /** @type {any[]} */
    const newValue = Filter.applyForOutput(viewModelValue, filters, component.filters.out) ?? [];

    if (this.lastCount > newValue.length) {
      const removeTemplateChildren = this.templateChildren.splice(newValue.length);
      TemplateBind.removeFromParent(removeTemplateChildren);
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    } else if (this.lastCount < newValue.length) {
      // コンテキスト用のデータ
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
      const pos = context.indexes.length;
      const propName = this.viewModelPropertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      const newTemplateChildren = [];
      for(let i = this.lastCount; i < newValue.length; i++) {
        const newIndex = i;
        const newContext = Context.clone(context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos});
        newTemplateChildren.push(TemplateChild.create(this, newContext));
      }
      TemplateBind.appendToParent(this.lastChild?.lastNode ?? this.node, newTemplateChildren);
      this.templateChildren = this.templateChildren.concat(newTemplateChildren);
    } else {
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    }
    this.lastCount = newValue.length;
  }

  /** 
   * @param {TemplateChild[]} templateChildren
   * @returns {void}
   */
  static removeFromParent(templateChildren) {
    templateChildren.forEach(templateChild => {
      templateChild.removeFromParent();
      TemplateChild.dispose(templateChild);
    });
  }

  /**
   * @param {Node} parentNode
   * @param {TemplateChild[]} templateChildren
   * @returns {void}
   */
  static appendToParent(parentNode, templateChildren) {
    const fragment = document.createDocumentFragment();
    templateChildren
      .forEach(templateChild => {
        if (templateChild.childNodes.length > 0) fragment.appendChild(...templateChild.nodesForAppend);
      });
    parentNode.after(fragment);
  }

}

class ProcessData {
  /** @type {()=>void} */
  target;

  /** @type {Object} */
  thisArgument;

  /** @type {any[]} */
  argumentsList;

  /**
   * 
   * @param {()=>void} target 
   * @param {Object} thisArgument 
   * @param {any[]} argumentsList 
   */
  constructor(target, thisArgument, argumentsList) {
    this.target = target;
    this.thisArgument = thisArgument;
    this.argumentsList = argumentsList;
  }
}

class ViewModelUpdator {
  /** @type {ProcessData[]} */
  queue = [];

  /** @type {UpdateSlotStatusCallback} */
  #statusCallback;

  /**
   * @param {UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginViewModelUpdate);
    try {
      while(this.queue.length > 0) {
        const processes = this.queue.splice(0);
        for(const process of processes) {
          await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endViewMmodelUpdate);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

class Event extends BindInfo {
  /** @type {string} */
  #eventType;
  /** @type {string} */
  get eventType() {
    return this.#eventType;
  }
  set eventType(value) {
    this.#eventType = value;
  }

  /**
   * イベントハンドラを設定
   */
  addEventListener() {
    const {component, element, eventType, viewModel, viewModelProperty} = this;
    element.addEventListener(eventType, (event) => {
      event.stopPropagation();
      const context = this.context;
      const process = new ProcessData(
        viewModel[Symbols.directlyCall], viewModel, [viewModelProperty, context, event]
      );
      component.updateSlot.addProcess(process);
    });
  }
}

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const toComponent = node => (node[Symbols.isComponent]) ? node : utils.raise('not Component');

class ComponentBind extends BindInfo {
  /** @type {Node} */
  get node() {
    return super.node;
  }
  set node(node) {
    this.thisComponent = toComponent(node);
    super.node = node;
  }

  /** @type {boolean} */
  #isSetProperty() {
    return (typeof this.viewModelProperty !== "undefined" && typeof this.nodePropertyElements !== "undefined");
  }

  /** @type {string} */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }

  /** @type {string[]} */
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }

  /** @type {string} */
  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }

  /** @type {string} */
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  /** @type {Component} */
  #thisComponent;
  /** @type {Component} */
  get thisComponent() {
    return this.#thisComponent;
  }
  set thisComponent(value) {
    this.#thisComponent = value;
  }

  /**
   * プロパティをバインドする
   */
  bindProperty() {
    this.thisComponent.props[Symbols.bindProperty](this.dataProperty, this.viewModelProperty, this.indexes);
    const dataProperty = this.dataProperty;
    Object.defineProperty(this.thisComponent.viewModel, dataProperty, {
      get: function () { return this.$props[dataProperty]; },
      set: function (value) { this.$props[dataProperty] = value; },
    });
  }

  /**
   * 親コンポーネントからの更新をこのコンポーネントに反映する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  applyToNode(setOfUpdatedViewModelPropertyKeys) {
    const { viewModelProperty, dataProperty } = this;
    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const [ name, indexesString ] = key.split("\t");
      const propName = PropertyName.create(name);
      if (name === viewModelProperty || propName.setOfParentPaths.has(viewModelProperty)) {
        const remain = name.slice(viewModelProperty.length);
        const indexes = ((indexesString || null)?.split(",") ?? []).map(i => Number(i));
        this.thisComponent.viewModel?.[Symbols.writeCallback](`$props.${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.writeCallback](`${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${dataProperty}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`${dataProperty}${remain}`, indexes);
      }
    }
  }

}

const STYLE_PROPERTY = "style";

class StyleBind extends BindInfo {
  /** @type {string} */
  get styleName() {
    return this.nodePropertyElements[1];
  }

  /** @type {string} */
  get nodeValue() {
    return this.htmlElement.style[this.styleName];
  }
  set nodeValue(value) {
    this.htmlElement.style[this.styleName] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== filteredViewModelValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, STYLE_PROPERTY, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }
}


// ToDo: ViewModelのプロパティの値とstyleの属性値が合わない場合をどうするか
// たとえば、
//   間違ったcolorをViewModelのプロパティを指定すると、styleのcolor属性には値は入らない
//   colorを#fffで、ViewModelのプロパティに指定すると、styleのcolor属性にはrgb(255,255,255)で入っている

class PropertyBind extends BindInfo {
  /** @type {string} */
  get propName() {
    return this.nodePropertyElements[0];
  }

  /** @type {any} */
  get nodeValue() {
    return this.node[this.propName];
  }
  set nodeValue(value) {
    this.node[this.propName] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, propName, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, propName, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }

}

const DEFAULT_PROPERTY$2 = "textContent";

class TextBind extends BindInfo {
  /** @type {string} */
  get nodeValue() {
    return this.node[DEFAULT_PROPERTY$2];
  }
  set nodeValue(value) {
    this.node[DEFAULT_PROPERTY$2] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, DEFAULT_PROPERTY$2, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }

}

class Factory {
  /**
   * @type {Object<number, classof<BindInfo>>}
   */
  static classByType;
  static setup() {
    this.classByType = {};
    this.classByType[NodePropertyType.property] = PropertyBind;
    this.classByType[NodePropertyType.attribute] = AttributeBind;
    this.classByType[NodePropertyType.classList] = ClassListBind;
    this.classByType[NodePropertyType.className] = ClassNameBind;
    this.classByType[NodePropertyType.radio] = Radio;
    this.classByType[NodePropertyType.checkbox] = Checkbox;
    this.classByType[NodePropertyType.template] = TemplateBind;
    this.classByType[NodePropertyType.event] = Event;
    this.classByType[NodePropertyType.component] = ComponentBind;
    this.classByType[NodePropertyType.style] = StyleBind;
    this.classByType[NodePropertyType.text] = TextBind;
    return this.classByType;
  }

  /**
   * バインド情報を生成する
   * @param {Component} component
   * @param {Node} node
   * @param {string} nodeProperty
   * @param {ViewModel} viewModel
   * @param {string} viewModelProperty
   * @param {Filter[]} filters
   * @param {ContextInfo} context
   * @returns {BindInfo}
   */
  static create(component, node, nodeProperty, viewModel, viewModelProperty, filters, context) {
    const nodeInfo = NodePropertyInfo.get(node, nodeProperty);
    /** @type {BindInfo} */
    const bindInfo = new (this.classByType ?? this.setup())[nodeInfo.type];
    bindInfo.component = component;
    bindInfo.node = node;
    bindInfo.nodeProperty = nodeProperty;
    bindInfo.viewModel = viewModel;
    bindInfo.viewModelProperty = viewModelProperty;
    bindInfo.filters = filters;
    bindInfo.context = context;
    bindInfo.nodePropertyElements = nodeInfo.nodePropertyElements;
    bindInfo.eventType = nodeInfo.eventType;
    if (bindInfo.viewModelPropertyName.level > 0 && bindInfo.indexes.length === 0) {
      utils.raise(`${bindInfo.viewModelPropertyName.name} is outside loop`);
    }
    return bindInfo;
  }
}

const SAMENAME = "@";
const DEFAULT = "$";

class BindTextInfo {
  /** @type {string} bindするnodeのプロパティ名 */
  nodeProperty;
  /** @type {string} bindするviewModelのプロパティ名 */
  viewModelProperty;
  /** @type {Filter[]} 適用するフィルターの配列 */
  filters;
}

/**
 * トリム関数
 * @param {string} s 
 * @returns {string}
 */
const trim = s => s.trim();

/**
 * 長さチェック関数
 * @param {string} s 
 * @returns {string}
 */
const has = s => s.length > 0;

/**
 * フィルターのパース
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 * @param {string} text 
 * @returns {Filter}
 */
const parseFilter = text => {
  const [name, ...options] = text.split(",").map(trim);
  return Object.assign(new Filter, {name, options});
};

/**
 * ViewModelプロパティのパース
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 * @param {string} text 
 * @returns {{viewModelProperty:string,filters:Filter[]}}
 */
const parseViewModelProperty = text => {
  const [viewModelProperty, ...filterTexts] = text.split("|").map(trim);
  return {viewModelProperty, filters:filterTexts.map(text => parseFilter(text))};
};

/**
 * 式のパース
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 * @param {string} expr 
 * @param {string} defaultName 
 * @returns {BindTextInfo}
 */
const parseExpression = (expr, defaultName) => {
  const [nodeProperty, viewModelPropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { viewModelProperty, filters } = parseViewModelProperty(viewModelPropertyText);
  return { nodeProperty, viewModelProperty, filters };
};

/**
 * data-bind属性値のパース
 * @param {string} text data-bind属性値
 * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {BindTextInfo[]}
 */
const parseBindText = (text, defaultName) => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, viewModelProperty, filters } = parseExpression(s, DEFAULT);
    viewModelProperty = viewModelProperty === SAMENAME ? nodeProperty : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    typeof nodeProperty === "undefined" && utils.raise("default property undefined");
    return { nodeProperty, viewModelProperty, filters };
  });
};

/**
 * data-bind属性をパースする関数群
 */
class Parser {
  /** @type {Object<string,BindTextInfo[]>} */
  static bindTextsByKey = {};

  /**
   * data-bind属性値のパースし、BindTextInfoの配列を返す
   * @param {string} text data-bind属性値
   * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
   * @returns {BindTextInfo[]}
   */
  static parse(text, defaultName) {
    /** @type {string} */
    const key = text + "\t" + defaultName;
    /** @type {BindTextInfo[] | undefined} */
    let binds = this.bindTextsByKey[key];

    if (typeof binds === "undefined") {
      binds = parseBindText(text, defaultName).map(bind => Object.assign(new BindTextInfo, bind));
      this.bindTextsByKey[key] = binds;
    }
    return binds;
  }
}

class BindToDom {
  /**
   * data-bind属性値からバインド情報を生成
   * @param {Node} node 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @param {ContextInfo} context
   * @param {string} text data-bind属性値
   * @param {string} defaultName
   * @returns {BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, context, text, defaultName) => {
    const bindInfos = 
      Parser.parse(text, defaultName).map(info => Factory.create(component, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters, context));
    return bindInfos;
  }

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
}

const DATASET_BIND_PROPERTY$3 = "data-bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY$1 = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`not HTMLElement`);

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : "value") : 
  DEFAULT_PROPERTY$1;
};

/**
 * Eventクラスへ変換
 * @param {BindInfo} bind 
 * @returns {Event|undefined}
 */
const toEvent$1 = bind => (bind instanceof Event) ? bind : undefined; 

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement);


class BindToHTMLElement {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {HTMLElement}  */
    const element = toHTMLElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$3);
    /** @type {string} */
    const defaultName = getDefaultProperty(element);

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    /** @type {boolean} デフォルトイベントを設定したかどうか */
    let hasDefaultEvent = false;

    /** @type {BindInfo|null} */
    let defaultBind = null;

    /** @type {Radio|null} */
    let radioBind = null;

    /** @type {Checkbox|null} */
    let checkboxBind = null;

    binds.forEach(bind => {
      hasDefaultEvent ||= bind.nodeProperty === DEFAULT_EVENT;
      radioBind = (bind instanceof Radio) ? bind : radioBind;
      checkboxBind = (bind instanceof Checkbox) ? bind : checkboxBind;
      defaultBind = (bind.nodeProperty === defaultName) ? bind : defaultBind;
      toEvent$1(bind)?.addEventListener();
    });

    /** @type {(bind:BindInfo)=>void} */
    const setDefaultEventHandler = (bind) => {
      const eventHandler = event => {
        event.stopPropagation();
        const process = new ProcessData(bind.updateViewModel, bind, []);
        component.updateSlot.addProcess(process);
      };
      element.addEventListener(DEFAULT_EVENT_TYPE, eventHandler);
      bind.defaultEventHandler = eventHandler;
      bind.defaultEventType = DEFAULT_EVENT_TYPE;
    };
    if (radioBind) {
      setDefaultEventHandler(radioBind);
    } else if (checkboxBind) {
      setDefaultEventHandler(checkboxBind);
    } else if (defaultBind && !hasDefaultEvent && isInputableElement(node)) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBind);
    }
    return binds;
  }
}

const DATASET_BIND_PROPERTY$2 = "data-bind";

/**
 * 
 * @param {Node} node 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`not SVGElement`);

/**
 * 
 * @param {BindInfo} bind 
 * @returns {Event|undefined}
 */
const toEvent = bind => (bind instanceof Event) ? bind : undefined; 

class BindToSVGElement {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {SVGElement} */
    const element = toSVGElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$2);
    /** @type {string|undefined} */
    const defaultName = undefined;

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    binds.forEach(bind => {
      toEvent(bind)?.addEventListener();
    });

    return binds;
  }

}

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment$1 = node => (node instanceof Comment) ? node : utils.raise("not Comment");

class BindToText {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    // コメントノードをテキストノードに差し替える
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {Comment} */
    const comment = toComment$1(node);
    /** @type {string} */
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    /** @type {Text} */
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(textNode, component, viewModel, context, bindText, DEFAULT_PROPERTY);
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }

}

const DATASET_BIND_PROPERTY$1 = "data-bind";
/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise("not Comment");

class BindToTemplate {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const uuid = comment.textContent.slice(3);
    /** @type {HTMLTemplateElement} */
    const template = Templates.templateByUUID.get(uuid);
    /** @type {string} */
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY$1);

    // パース
    /** @type {BindInfo[]} */
    let binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, undefined);
    binds = binds.length > 0 ? [ binds[0] ] : [];
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }
}

class Binder {
  /**
   * バインドを実行する
   * @param {Node[]} nodes
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(nodes, component, context) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(node, component, context) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(node, component, context) :
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(node, component, context) : 
      (node instanceof SVGElement) ? BindToSVGElement.bind(node, component, context) :
      utils.raise(`unknown node type`)
    );
  }

}

const SELECTOR = "[data-bind]";

/**
 * ルートノードから、ノードまでのchileNodesのインデックスリストを取得する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param {Node} node 
 * @returns {number[]}
 */
const getNodeRoute = node => {
  /** @type {number[]} */
  let routeIndexes = [];
  while(node.parentNode != null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node) ].concat(routeIndexes);
    node = node.parentNode;
  }
  return routeIndexes;
};

/**
 * ルートのインデックス配列からノード取得する
 * @param {Node} node 
 * @param {number[]} routeIndexes 
 * @returns {Node}
 */
const getNodeByRouteIndexes = (node, routeIndexes) => {
  for(let i = 0; i < routeIndexes.length; i++) {
    node = node.childNodes[routeIndexes[i]];
  }
  return node;
};

/**
 * ノードがコメントかどうか
 * @param {Node} node 
 * @returns {boolean}
 */
const isCommentNode = node => node instanceof Comment && (node.textContent.startsWith("@@:") || node.textContent.startsWith("@@|"));

/**
 * コメントノードを取得
 * @param {Node} node 
 * @returns {Comment[]}
 */
const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : null)).filter(node => node);

class Selector {
  /** @type {Map<HTMLTemplateElement, number[][]>} */
  static listOfRouteIndexesByTemplate = new Map();

  /**
   * テンプレートからバインドする対象のノードを取得する
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement
   * @returns {Node[]}
   */
  static getTargetNodes(template, rootElement) {

    /** @type {Node[]} */
    let nodes;

    if (this.listOfRouteIndexesByTemplate.has(template)) {
      // キャッシュがある場合
      // querySelectorAllを行わずにNodeの位置を特定できる
      /** @type {number[][]} */
      const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
      nodes = listOfRouteIndexes.map(routeIndexes => getNodeByRouteIndexes(rootElement, routeIndexes));
    } else {
      // data-bind属性を持つエレメント、コメント（内容が@@で始まる）のノードを取得しリストを作成する
      nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));

      // ノードのルート（DOMツリーのインデックス番号の配列）をキャッシュに覚えておく
      this.listOfRouteIndexesByTemplate.set(template, nodes.map(node => getNodeRoute(node)));
    }
    return nodes;

  }

}

class ViewTemplate {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Component} component 
   * @param {ContextInfo} contextInfo
   * @returns {{binds:BindInfo[], content:DocumentFragment}}
   */
  static render(component, template, context) {
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    const binds = Binder.bind(nodes, component, context);
    return { binds, content };
  }
}

class View {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @returns {BindInfo[]}
   */
  static render(rootElement, component, template) {
    const { binds, content } = ViewTemplate.render(component, template, Context.create());
    rootElement.appendChild(content);
    return binds;
  }
}

class Cache {
  /** @type {Map<PropertyName,Map<string,any>>} */
  #valueByIndexesStringByPropertyName = new Map;
  
  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(propName, indexes) {
    const valueByIndexesString = this.#valueByIndexesStringByPropertyName.get(propName);
    return valueByIndexesString ? valueByIndexesString.get(indexes.toString()) : undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexes, value) {
    let valueByIndexesString = this.#valueByIndexesStringByPropertyName.get(propName);
    if (!valueByIndexesString) {
      valueByIndexesString = new Map;
      this.#valueByIndexesStringByPropertyName.set(propName, valueByIndexesString);
    }
    valueByIndexesString.set(indexes.toString(), value);
    return value;
  }

  /**
   * @returns {void}
   */
  clear() {
    this.#valueByIndexesStringByPropertyName.clear();
  }

}

/**
 * @typedef {{
 *   removeProps:string[],
 *   definedProps:string[],
 *   accessorProps:string[],
 *   methods:string[]
 * }} ViewModelInfo
 */
class ViewModelize {
  /**
   * オブジェクトのすべてのプロパティのデスクリプタを取得する
   * 継承元を遡る、ただし、Objectのプロパティは取得しない
   * @param {ViewModel} target 
   * @returns {Map<string,PropertyDescriptor>}
   */
  static getDescByName(target) {
    /**
     * @type {Map<string,PropertyDescriptor>}
     */
    const descByName = new Map;
    let object = target;
    while(object !== Object.prototype) {
      const descs = Object.getOwnPropertyDescriptors(object);
      for(const [name, desc] of Object.entries(descs)) {
        if (descByName.has(name)) continue;
        descByName.set(name, desc);
      }
      object = Object.getPrototypeOf(object);
    }
    return descByName;
  }

  /**
   * オブジェクト内のメソッドを取得する
   * コンストラクタは含まない
   * @param {[string,PropertyDescriptor][]} descByNameEntries 
   * @returns {[string,PropertyDescriptor][]}
   */
  static getMethods(descByNameEntries, targetClass) {
    return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value === "function")
  }

  /**
   * オブジェクト内のプロパティを取得する
   * @param {[string,PropertyDescriptor][]} descByNameEntries 
   * @returns {[string,PropertyDescriptor][]}
   */
  static getProperties(descByNameEntries, targetClass) {
    return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value !== "function")
  }

  /**
   * ViewModel化
   * ・非プリミティブかつ初期値のないプロパティは削除する
   * @param {class<ViewModel>} target 
   * @returns {{definedProps:string[],methods:string[],accessorProps:string[],viewModel:any}}
   */
  static viewModelize(target) {
    const viewModelConstructor = target.constructor;
    let viewModelInfo = this.viewModelInfoByConstructor.get(viewModelConstructor);
    if (!viewModelInfo) {
      const descByName = this.getDescByName(target);
      const descByNameEntries = Array.from(descByName.entries());
      const removeProps = [];
      const definedProps = [];
      const accessorProps = [];
      const methods = this.getMethods(descByNameEntries, target.constructor).map(([name, desc]) => name);
      this.getProperties(descByNameEntries, target.constructor).forEach(([name, desc]) => {
        definedProps.push(name);
        const propName = PropertyName.create(name);
        if (!propName.isPrimitive) {
          if (("value" in desc) && typeof desc.value === "undefined") {
            removeProps.push(name);
          }
        }
        if ("get" in desc && typeof desc.get !== "undefined") {
          accessorProps.push(name);
        }
      });
      viewModelInfo = { removeProps, definedProps, methods, accessorProps };
      this.viewModelInfoByConstructor.set(viewModelConstructor, viewModelInfo);
    }
    viewModelInfo.removeProps.forEach(propertyKey => Reflect.deleteProperty(target, propertyKey));
    return {
      definedProps:viewModelInfo.definedProps, 
      methods:viewModelInfo.methods, 
      accessorProps:viewModelInfo.accessorProps,
      viewModel:target
    };
  }

  /** @type {Map<class<ViewModel>,ViewModelInfo>} */
  static viewModelInfoByConstructor = new Map;
  
}

/**
 * $dependentPropsを表現
 */
class DependentProps {
  /** @type {Set<string>} */
  #setOfDefaultProps = new Set;

  /** @type {Map<string,Set<string>>} */
  #setOfPropsByRefProp = new Map;
  /** @type {Map<string,Set<string>>} */
  get setOfPropsByRefProp() {
    return this.#setOfPropsByRefProp;
  }

  /**
   * @param {string} prop
   * @returns {boolean} 
   */
  hasDefaultProp(prop) {
    return this.#setOfDefaultProps.has(prop);
  }

  /**
   * 
   * @param {string} prop 
   * @returns {void}
   */
  addDefaultProp(prop) {
    let currentName = PropertyName.create(prop);
    while(currentName.parentPath !== "") {
      const parentName = PropertyName.create(currentName.parentPath);
      if (!this.#setOfDefaultProps.has(currentName.name)) {
        this.#setOfPropsByRefProp.get(parentName.name)?.add(currentName.name) ?? this.#setOfPropsByRefProp.set(parentName.name, new Set([currentName.name]));
        this.#setOfDefaultProps.add(currentName.name);
      }
      currentName = parentName;
    }
  }

  /**
   * 
   * @param {{prop:string,refProps:string[]}} props 
   * @returns {void}
   */
  setDependentProps(props) {
    for(const [prop, refProps] of Object.entries(props)) {
      for(const refProp of refProps) {
        this.#setOfPropsByRefProp.get(refProp)?.add(prop) ?? this.#setOfPropsByRefProp.set(refProp, new Set([prop]));
      }
    }
  }

}

const INIT_CALLBACK = "$initCallback";
const WRITE_CALLBACK = "$writeCallback";
const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";

/**
 * @type {{symbol:Symbol,callbackName:string}}
 */
const callbackNameBySymbol = {
  [Symbols.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols.writeCallback]: WRITE_CALLBACK,
  [Symbols.initCallback]: INIT_CALLBACK,
};
/**
 * @type {Set<Symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols.connectedCallback,
  Symbols.disconnectedCallback,
  Symbols.writeCallback,
  Symbols.initCallback,
]);

/**
 * 
 */
const setOfApiFunctions = new Set([
  Symbols.directlyCall,
  Symbols.getDependentProps,
  //Symbols.addNotify,
  Symbols.notifyForDependentProps,
  Symbols.getHandler,
  Symbols.beCacheable,
  Symbols.beUncacheable,
]);

const PROPS_PROPERTY = "$props";
const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const OPEN_DIALOG_METHOD = "$openDialog";
const CLOSE_DIALOG_METHOD = "$closeDialog";
const COMPONENT_PROPERTY = "$component";

/**
 * @type {Set<string>}
 */
const setOfProperties = new Set([
  PROPS_PROPERTY,
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  OPEN_DIALOG_METHOD,
  CLOSE_DIALOG_METHOD,
  COMPONENT_PROPERTY,
]);

/**
 * キャッシュ機能
 *   ViewModelのアクセサプロパティなら、キャッシュする
 * 配列プロキシ
 * 通知機能
 *   ViewModelのプロパティを更新した場合、関連するプロパティの更新通知を発行する
 * コンポーネントイベントハンドラ呼び出し
 *   初期化：$initCallback
 *   プロパティ書き込み：$writeCallback
 *   DOMツリー追加時：$connectedCallback
 *   DOMツリー削除時：$disconnectedCallback
 * バインドイベントハンドラ呼び出し
 * コンテキスト変数の提供
 *   インデックス：$1～$8
 *   コンポーネント：$component
 */
/**
 * @type {ProxyHandler<ViewModel>}
 */
class ViewModelHandler extends Handler$2 {
  /** @type {Component} */
  #component;
  /** @type {Component} */
  get component() {
    return this.#component;
  }

  /** @type {Cache} */
  #cache = new Cache;
  /** @type {Cache} */
  get cache() {
    return this.#cache;
  }

  /** @type {string[]} */
  #methods;
  /** @type {string[]} */
  get methods() {
    return this.#methods;
  }

  /** @type {string[]} */
  #accessorProperties;
  /** @type {string[]} */
  get accessorProperties() {
    return this.#accessorProperties;
  }

  /** @type {Set<string>} */
  #setOfAccessorProperties;
  /** @type {Set<string>} */
  get setOfAccessorProperties() {
    return this.#setOfAccessorProperties;
  }

  /** @type {DependentProps} */
  #dependentProps = new DependentProps
  /** @type {DependentProps} */
  get dependentProps() {
    return this.#dependentProps;
  }

  /** @type {boolean} */
  #cacheable = false;
  /** @type {boolean} */
  get cacheable() {
    return this.#cacheable;
  }
  set cacheable(value) {
    this.#cacheable = value;
  }

  /** @type {ContextInfo} */
  #context;
  /** @type {ContextInfo} */
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
  }

  /**
   * 
   * @param {Component} component
   * @param {string[]} accessorProperties
   * @param {string[]} methods
   * @param {{prop:string,refProps:string[]}|undefined}
   */
  constructor(component, accessorProperties, methods, dependentProps) {
    super();
    this.#component = component;
    this.#methods = methods;
    this.#accessorProperties = accessorProperties;
    this.#setOfAccessorProperties = new Set(this.#accessorProperties);
    this.#dependentProps.setDependentProps(dependentProps ?? {});
  }

  /**
   * プロパティ情報からViewModelの値を取得する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}  
   * @param {Proxy} receiver 
   */
  getByPropertyName(target, { propName }, receiver) {
    if (!propName.isPrimitive) {
      !this.#dependentProps.hasDefaultProp(propName.name) && this.#dependentProps.addDefaultProp(propName.name);
    }
    let value;
    if (setOfProperties.has(propName.name)) {
      if (propName.name === PROPS_PROPERTY) {
        return this.component.props;
      } else if (propName.name === GLOBALS_PROPERTY) {
        return this.component.globals;
      } else if (propName.name === DEPENDENT_PROPS_PROPERTY) {
        return Reflect.get(target, DEPENDENT_PROPS_PROPERTY, receiver);
      } else if (propName.name === OPEN_DIALOG_METHOD) {
        return (name, data = {}, attributes = {}) => Reflect.apply(this.#openDialog, this, [target, {name, data, attributes}, receiver])
      } else if (propName.name === COMPONENT_PROPERTY) {
        return this.component;
      } else {
        return (data = {}) => Reflect.apply(this.#closeDialog, this, [target, data, receiver]);
      }
    } else {
      if (this.#setOfAccessorProperties.has(propName.name) && this.#cacheable) {
        // アクセサプロパティの場合、キャッシュから取得する
        const indexes = propName.level > 0 ? this.lastIndexes.slice(0, propName.level) : [];
        value = this.#cache.get(propName, indexes);
        if (typeof value === "undefined") {
          value = super.getByPropertyName(target, { propName }, receiver);
          this.#cache.set(propName, indexes, value);
        }
      } else {
        value = super.getByPropertyName(target, { propName }, receiver);
      }
    }
    return value;
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,value:any}}  
   * @param {Proxy} receiver 
   */
  setByPropertyName(target, { propName, value }, receiver) {
    if (!propName.isPrimitive) {
      !this.#dependentProps.hasDefaultProp(propName.name) && this.#dependentProps.addDefaultProp(propName.name);
    }
    const indexes = this.lastIndexes;
    const propertyAccess = { propName, indexes };
    const result = super.setByPropertyName(target, { propName, value }, receiver);
    receiver[Symbols.writeCallback](propName.name, indexes);
    this.#addNotify(target, propertyAccess, receiver);

    return result;
  }

  /**
   * 更新処理をキューイングする
   * @param {ViewModel} target 
   * @param {Proxy} thisArg 
   * @param {any[]} argumentArray 
   */
  #addProcess(target, thisArg, argumentArray) {
    this.#component.updateSlot.addProcess(new ProcessData(target, thisArg, argumentArray));
  }

  /**
   * 更新情報をキューイングする
   * @param {ViewModel} target 
   * @param {PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  #addNotify(target, propertyAccess, receiver) {
    this.#component.updateSlot.addNotify(propertyAccess);
  }

  /**
   * コンポーネントを動的に表示し、消滅するまで待つ
   * @param {any} target 
   * @param {{name:string,data:object,attributes:any}} param1 
   * @param {Proxy} receiver 
   */
  async #openDialog(target, {name, data, attributes}, receiver) {
    const tagName = utils.toKebabCase(name);
    const dialog = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      dialog.setAttribute(key, value);
    });
    Object.entries(data).forEach(([key, value]) => {
      dialog.props[Symbols.bindProperty](key, key, []);
      dialog.props[key] = value;
    });
    document.body.appendChild(dialog);
    return dialog.alivePromise;
  }

  /**
   * 動的に表示されたコンポーネントを閉じる
   * @param {ViewModel} target 
   * @param {Object<string,any>} data 
   * @param {Proxy} receiver 
   */
  #closeDialog(target, data, receiver) {
    const component = this.#component;
    Object.entries(data).forEach(([key, value]) => {
      component.props[key] = value;
    });
    component.parentNode.removeChild(component);
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {{prop:string,indexes:number[]}} 
   * @param {Proxy<>} receiver 
   * @returns {any}
   */
  [Symbols.directlyGet](target, {prop, indexes}, receiver) {
    return super[Symbols.directlyGet](target, {prop, indexes}, receiver);
  }

  /**
   * キャッシュ機能をオン
   * @param {ViewModel} target 
   * @param {Proxy<>} receiver 
   * @returns {boolean}
   */
  [Symbols.beCacheable](target, receiver) {
    this.cacheable = true;
    this.#cache.clear();
    return this.cacheable;
  }

  /**
   * キャッシュ機能をオフ
   * @param {ViewModel} target 
   * @param {Proxy<>} receiver 
   * @returns {boolean}
   */
  [Symbols.beUncacheable](target, receiver) {
    this.cacheable = false;
    return this.cacheable;
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,context:ContextInfo,event:Event}} param1 
   * @param {Proxy} receiver 
   */
  async #directryCall(target, { propName, context, event }, receiver) {
    if (typeof this.context !== "undefined") utils.raise("directCall already called");
    this.context = context;
    this.stackIndexes.push(undefined);
    try {
      return await Reflect.apply(target[propName.name], receiver, [event, ...context.indexes]);
    } finally {
      this.stackIndexes.pop();
      this.context = undefined;
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy} receiver 
   * @returns {any}
   */
  get(target, prop, receiver) {
    if (setOfAllCallbacks.has(prop)) {
      const callbackName = callbackNameBySymbol[prop];
      const applyCallback = (...args) => async () => Reflect.apply(target[callbackName], receiver, args);
      if (prop === Symbols.initCallback) {
        return (callbackName in target) ? (...args) => applyCallback(...args)() : () => {};
      } else {
        return (callbackName in target) ? (...args) => this.#addProcess(applyCallback(...args), receiver, []) : () => {};
      }
    } else if (setOfApiFunctions.has(prop)) {
      if (prop === Symbols.directlyCall) {
        return async (prop, context, event) => 
          this.#directryCall(target, { propName:PropertyName.create(prop), context, event }, receiver);
      } else if (prop === Symbols.notifyForDependentProps) {
        return (prop, indexes) => {
          const propertyAccess = { propName:PropertyName.create(prop), indexes };
          this.#addNotify(target, propertyAccess, receiver);
        }
      } else if (prop === Symbols.getDependentProps) {
        return () => this.dependentProps;
      } else if (prop === Symbols.getHandler) {
        return () => this;
      } else if (prop === Symbols.beCacheable) {
        return () => Reflect.apply(this[Symbols.beCacheable], this, [target, receiver]);
//      } else if (prop === Symbols.beUncacheable) {
      } else {
        return () => Reflect.apply(this[Symbols.beUncacheable], this, [target, receiver]);
      }
    } else {
      let value;
      do {
        if (typeof prop === "string" && !prop.startsWith("@@__") && prop !== "constructor") {
          const propName = PropertyName.create(prop);
          if (typeof this.context !== "undefined" && propName.level > 0 && prop.at(0) !== "@") {
            const param = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
            if (typeof param === "undefined") utils.raise(`${prop} is outside loop`);
            value = this[Symbols.directlyGet](target, { prop, indexes:param.indexes}, receiver);
            break;
          }
        }
        value = super.get(target, prop, receiver);
      } while(false);
      return value;
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   * @returns {boolean}
   */
  set(target, prop, value, receiver) {
    let result;
    do {
      if (typeof prop === "string" && !prop.startsWith("@@__") && prop !== "constructor") {
        const propName = PropertyName.create(prop);
        if (typeof this.context !== "undefined" && propName.level > 0 && prop.at(0) !== "@") {
          const param = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
          if (typeof param === "undefined") utils.raise(`${prop} is outside loop`);
          result = this[Symbols.directlySet](target, { prop, indexes:param.indexes, value}, receiver);
          break;
        }
      }
      result = super.set(target, prop, value, receiver);
    } while(false);
    return result;
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {PropertyAccess} propertyAccess
   * @param {string} prop 
   * @param {number[]} indexes 
   * @returns {PropertyAccess[]}
   */
  static makeNotifyForDependentProps(viewModel, propertyAccess, setOfSavePropertyAccessKeys = new Set([])) {
    const { propName, indexes } = propertyAccess;
    const propertyAccessKey = propName.name + "\t" + indexes.toString();
    if (setOfSavePropertyAccessKeys.has(propertyAccessKey)) return [];
    setOfSavePropertyAccessKeys.add(propertyAccessKey);
    const dependentProps = viewModel[Symbols.getDependentProps]();
    const setOfProps = dependentProps.setOfPropsByRefProp.get(propName.name);
    const propertyAccesses = [];
    if (typeof setOfProps === "undefined") return [];
    for(const prop of setOfProps) {
      const curPropName = PropertyName.create(prop);
      if (indexes.length < curPropName.level) {
        const listOfIndexes = ViewModelHandler.expandIndexes(viewModel, { propName:curPropName, indexes });
        propertyAccesses.push(...listOfIndexes.map(indexes => ({ propName:curPropName, indexes })));
      } else {
        const notifyIndexes = indexes.slice(0, curPropName.level);
        propertyAccesses.push({ propName:curPropName, indexes:notifyIndexes });
      }
      propertyAccesses.push(...this.makeNotifyForDependentProps(viewModel, { propName:curPropName, indexes }, setOfSavePropertyAccessKeys));
    }
    return propertyAccesses;
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {PropertyAccess} propertyAccess
   * @param {number[]} indexes 
   * @returns {number[][]}
   */
  static expandIndexes(viewModel, propertyAccess) {
    const { propName, indexes } = propertyAccess;
    if (propName.level === indexes.length) {
      return [ indexes ];
    } else if (propName.level < indexes.length) {
      return [ indexes.slice(0, propName.level) ];
    } else {
      /**
       * 
       * @param {string} parentName 
       * @param {number} elementIndex 
       * @param {number[]} loopIndexes 
       * @returns {number[][]}
       */
      const traverse = (parentName, elementIndex, loopIndexes) => {
        const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
        const element = propName.pathNames[elementIndex];
        const isTerminate = (propName.pathNames.length - 1) === elementIndex;
        const currentName = parentNameDot + element;
        let retIndexes;
        if (isTerminate) {
          if (element === "*") {
            retIndexes = (viewModel[Symbols.directlyGet](parentName, loopIndexes)).flatMap((value, index) => {
              return [ loopIndexes.concat(index) ];
            });
          } else {
            retIndexes = [ loopIndexes ];
          }
        } else {
          if (element === "*") {
            if (loopIndexes.length < indexes.length) {
              retIndexes = traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
            } else {
              retIndexes = (viewModel[Symbols.directlyGet](parentName, loopIndexes)).flatMap((value, index) => {
                return traverse(currentName, elementIndex + 1, loopIndexes.concat(index));
              });
            }
          } else {
            retIndexes = traverse(currentName, elementIndex + 1, loopIndexes);
          }

        }
        return retIndexes;
      };
      const listOfIndexes = traverse("", 0, []);
      return listOfIndexes;
    }
  }
}

/**
 * 
 * @param {Component} component 
 * @param {class<ViewModel>} viewModelClass 
 * @returns {Proxy<ViewModel>}
 */
function createViewModel(component, viewModelClass) {
  const viewModelInfo = ViewModelize.viewModelize(Reflect.construct(viewModelClass, []));
  const { viewModel, accessorProps, methods } = viewModelInfo;
  return new Proxy(viewModel, new ViewModelHandler(component, accessorProps, methods, viewModel[DEPENDENT_PROPS_PROPERTY]));
}

const toTemplateBind = bind => (bind instanceof TemplateBind) ? bind : undefined;

class Binds {
  /**
   * Templateバインドをバインドツリーから取得
   * @param {BindInfo[]} binds
   * @param {Set<string>} setOfKey 
   * @returns {Template[]}
   */
  static getTemplateBinds(binds, setOfKey) {
    const templateBinds = [];
    const stack = [ { binds, children:null, index:-1 } ];
    while(stack.length > 0) {
      const info = stack[stack.length - 1];
      info.index++;
      if (info.binds) {
        if (info.index < info.binds.length) {
          const template = toTemplateBind(info.binds[info.index]);
          if (template) {
            if (setOfKey.has(template.viewModelPropertyKey)) {
              templateBinds.push(template);
            } else {
              if (template.templateChildren.length > 0) {
                stack.push({ binds:null, children:template.templateChildren, index:-1 });
              }
            }
          }
        } else {
          stack.pop();
        }
      } else {
        if (info.index < info.children.length) {
          const child = info.children[info.index];
          if (child.binds.length > 0) {
            stack.push({ binds:child.binds, children:null, index:-1 });
          }
        } else {
          stack.pop();
        }
      }
    }

    return templateBinds;
  }

  /**
   * updateされたviewModelのプロパティにバインドされているnodeについてプロパティを更新する
   * @param {BindInfo[]} binds
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  static applyToNode(binds, setOfUpdatedViewModelPropertyKeys) {
    // templateを先に展開する
    /**
     * @type {Set<Template>}
     */
    const templateBinds = new Set(this.getTemplateBinds(binds, setOfUpdatedViewModelPropertyKeys));
    if (templateBinds.size > 0) {
      for(const templateBind of templateBinds) {
        templateBind.updateNode();
      }
    }

    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const updateNode = (binds) => {
      binds.forEach(bind => {
        if (!templateBinds.has(bind)) {
          if (bind instanceof ComponentBind) {
            // コンポーネントの場合
            bind.applyToNode(setOfUpdatedViewModelPropertyKeys);
          } else {
            if (setOfUpdatedViewModelPropertyKeys.has(bind.viewModelPropertyKey)) {
              bind.updateNode();
            }
          }
          toTemplateBind(bind)?.templateChildren.forEach(templateChild => updateNode(templateChild.binds));
        }
      });
    };
    updateNode(binds);
  }

}

/**
 * @typedef { {prop:string,value:any} } PropsAccessor
 */

/**
 * @type {ProxyHandler<typeof PropsAccessor>}
 */
let Handler$1 = class Handler {
  /** @type {Component} */
  #component;

  /** @type {Map<string,{bindProp:string,bindIndexes:number[]}>} */
  #bindPropByThisProp = new Map();

  /** @type {Proxy<typeof ViewModel>} */
  #data = new Proxy({}, new Handler$2);

  /** @type {boolean} */
  get hasParent() {
    return this.#component?.parentComponent?.viewModel != null;
  }

  /** @type {{key:string,value:any}|ViewModel} */
  get data() {
    const data = this.hasParent ? this.#component.parentComponent.viewModel : this.#data;
//    (data[Symbols.isSupportDotNotation]) || utils.raise(`data is not support dot-notation`);
    return data;
  }
  /** @type {Object<string,any>} */
  get object() {
    const retObject = {};
    if (this.hasParent) {
      const viewModel = this.#component.parentComponent.viewModel;
      for(const [key, bindAccess] of this.#bindPropByThisProp.entries()) {
        const { bindProp, bindIndexes } = bindAccess;
        retObject[key] = viewModel[Symbols.directlyGet](bindProp, bindIndexes);      }
    } else {
      for(const [key, value] of Object.entries(this.#data)) {
        retObject[key] = value;
      }
    }
    return retObject;
  }

  /** 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
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
      return (thisProp, bindProp, bindIndexes) => 
        this.#bindPropByThisProp.set(thisProp, { bindProp,  bindIndexes } );
    } else if (prop === Symbols.toObject) {
      return () => this.object;
    }
    const { data } = this;
    if (this.hasParent) {
      const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (bindProp) {
        return data[Symbols.directlyGet](bindProp, bindIndexes);
      } else {
        console.error(`undefined property ${prop}`);
        return undefined;
      }
    } else {
      return Reflect.get(data, prop);
    }
  }

  /**
   * Proxy.set
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Prooxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { data } = this;
    if (this.hasParent) {
      const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (bindProp) {
        return data[Symbols.directlySet](bindProp, bindIndexes, value);
      } else {
        console.error(`undefined property ${prop}`);
        return false;
      }
    } else {
      return Reflect.set(data, prop, value);
    }
  }
};

/**
 * 
 * @param {Component} component
 * @returns {Proxy<Handler>}
 */
function createProps(component) {
  return new Proxy({}, new Handler$1(component));
}

class GlobalDataHandler extends Handler$2 {
  /** @type {Map<string,Set<Component>>} */
  #setOfComponentByProp = new Map;

  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.boundByComponent) {
      return (component, prop) => {
        let setOfComponent = this.#setOfComponentByProp.get(prop);
        if (setOfComponent == null) {
          this.#setOfComponentByProp.set(prop, new Set([ component ]));
        } else {
          setOfComponent.add(component);
        }
      }
    }
    return super.get(target, prop, receiver);
  }

  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { propName, indexes } = PropertyName.parse(prop);
    const result = receiver[Symbols.directlySet](propName.name, indexes, value);
    let setOfComponent = this.#setOfComponentByProp.get(propName.name);
    if (setOfComponent) {
      for(const component of setOfComponent) {
        component.viewModel[Symbols.notifyForDependentProps]("$globals." + propName.name, indexes);
      }
    }
    return result;
  }

}

class GlobalData {
  /**
   * 
   * @returns 
   */
  static create() {
    return new Proxy({}, new GlobalDataHandler);
  }
  /**
   * @type {Object<string,any>}
   */
  static data = this.create();

}

/**
 * @typedef {{prop:string,value:any}} GlobalDataAccessor
 */
/**
 * @type {ProxyHandler<typeof GlobalDataAccessor>}
 */
class Handler {
  /** @type {Component} */
  #component;

  /** @type {Set<string>} */
  setOfProps = new Set;

  /**
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * プロパティをバインドする
   * @param {string} prop 
   */
  bindProperty(prop) {
    GlobalData.data[Symbols.boundByComponent](this.#component, prop);
    this.setOfProps.add(prop);
  }

  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   * @returns {any}
   */
  directGet = (name, indexes) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[Symbols.directlyGet](name, indexes);
  }

  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   * @param {any} value 
   * @returns {boolean}
   */
  directSet = (name, indexes, value) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[Symbols.directlySet](name, indexes, value);
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.directlyGet) {
      return this.directGet;
    } else if (prop === Symbols.directlySet) {
      return this.directSet;
    } else if (prop === Symbols.isSupportDotNotation) {
      return true;
    }
    const { propName, indexes } = PropertyName.parse(prop);
    return this.directGet(propName.name, indexes);
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Prooxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { propName, indexes } = PropertyName.parse(prop);
    return this.directSet(propName.name, indexes, value);
  }
}

/**
 * 
 * @param {Component} component
 * @returns {Proxy<Handler>}
 */
function createGlobals(component) {
  return new Proxy({}, new Handler(component));
}

const DATASET_BIND_PROPERTY = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

class Module {
  /** @type {string} */
  html;

  /** @type {string} */
  css;

  /** @type {class<ViewModel>} */
  ViewModel;

  /** @type {classOf<HTMLElement>} */
  extendClass;

  /** @type {string} */
  extendTag;

  /** @type {Object<string,FilterFunc>} */
  inputFilters;

  /** @type {Object<string,FilterFunc>} */
  outputFilters;

  /** @type {Object<string,Module>} */
  componentModules;

  /** @type {HTMLTemplateElement} */
  #template;
  /** @type {HTMLTemplateElement} */
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Module.htmlToTemplate(this.html, this.css);
    }
    return this.#template;
  }

  /**
   * HTMLの変換
   * {{loop:}}{{if:}}{{else:}}を<template>へ置換
   * {{end:}}を</template>へ置換
   * {{...}}を<!--@@:...-->へ置換
   * @param {string} html 
   * @returns {string}
   */
  static replaceTag(html) {
    const stack = [];
    const replacedHtml =  html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
      expr = expr.trim();
      if (expr.startsWith("loop:") || expr.startsWith("if:")) {
        stack.push(expr);
        return `<template data-bind="${expr}">`;
      } else if (expr.startsWith("else:")){
        const saveExpr = stack.at(-1);
        return `</template><template data-bind="${saveExpr}|not">`;
      } else if (expr.startsWith("end:")){
        stack.pop();
        return `</template>`;
      } else {
        return `<!--@@:${expr}-->`;
      }
    });
    // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
    const root = document.createElement("template"); // 仮のルート
    root.innerHTML = replacedHtml;
    const replaceTemplate = (element) => {
      /**
       * @type {Node}
       */
      let template;
      while(template = element.querySelector("template")) {
        const uuid =  utils.createUUID();
        const comment = document.createComment(`@@|${uuid}`);
        template.parentNode.replaceChild(comment, template);
        if (!(template instanceof HTMLTemplateElement)) {
          // SVGタグ内のtemplateタグを想定
          const newTemplate = document.createElement("template");
          for(let childNode of Array.from(template.childNodes)) {
            newTemplate.content.appendChild(childNode);
          }
          newTemplate.setAttribute(DATASET_BIND_PROPERTY, template.getAttribute(DATASET_BIND_PROPERTY));
          template = newTemplate;
        }
        template.setAttribute(DATASET_UUID_PROPERTY, uuid);
        replaceTemplate(template.content);
        Templates.templateByUUID.set(uuid, template);
      }
    };
    replaceTemplate(root.content);

    return root.innerHTML;
  }

  /**
   * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
   * @param {string?} html
   * @param {string?} css
   * @returns {HTMLTemplateElement}
   */
  static htmlToTemplate(html, css) {
    const template = document.createElement("template");
    template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? Module.replaceTag(html) : "");
    return template;
  }
}

/** @typedef {class<HTMLElement>} ComponentClass */

class Main {
  /**
   * @type {{
   * debug:boolean,
   * }}
   */
  static #config = {
    debug: false,
  };

  /**
   * 
   * @param {Object<string,ComponentClass>} components 
   * @returns {Main}
   */
  static components(components) {
    Object.entries(components).forEach(([name, componentClass]) => {
      const componentName = utils.toKebabCase(name);
      customElements.define(componentName, componentClass);
    });
    return this;
  }
  /**
   * 
   * @param {string} customElementName 
   * @param {UserComponentModule} componentModule 
   */
  static registComponentModule(customElementName, componentModule) {
    const customElementKebabName = utils.toKebabCase(customElementName);
    const componentClass = ComponentClassGenerator.generate(componentModule);
    if (componentModule.extendTag) {
      customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
    } else if (typeof componentModule?.extendClass === "undefined") {
      customElements.define(customElementKebabName, componentClass);
    } else {
      utils.raise("extendTag should be set");
    }
    if (componentModule.componentModules) {
      this.componentModules(componentModule.componentModules);
    }
  }
  /**
   * 
   * @param {Object<string,UserComponentModule>} components 
   * @returns {Main}
   */
  static componentModules(components) {
    Object.entries(components).forEach(([name, componentModule]) => {
      this.registComponentModule(name, componentModule);
    });
    return this;
  }
  /**
   * 
   * @param {Object<string,UserFilterData>} filters 
   * @returns {Main}
   */
  static filters(filters) {
    Object.entries(filters).forEach(([name, filterData]) => {
      const { input, output } = filterData;
      Filter.regist(name, output, input);
    });
    return this;
  }

  /**
   * 
   * @param {Object<string,any>} data 
   */
  static globals(data) {
    Object.assign(GlobalData.data, data);
  }
  /**
   * 
   * @param {{
   * debug:boolean,
   * }}  
   * @returns {Main}
   */
  static config({ 
    debug = false,
  }) {
    this.#config = Object.assign(this.#config, { debug });
    return this;
  }

  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
}

class ThreadStop extends Error {

}

class Thread {
  /** @type {Promise<(value:any)=>void>} */
  #resolve;

  /** @type {Promise<()=>void>} */
  #reject;

  /** @type {boolean} */
  #alive = true;
  /** @type {boolean} */
  get alive() {
    return this.#alive;
  }

  /**
   * 
   */
  constructor() {
    this.main();
  }

  /**
   * 
   * @returns {Promise<UpdateSlot>}
   */
  async #sleep() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  /**
   * @returns {void}
   */
  stop() {
    this.#reject(new ThreadStop("stop"));
  }

  /**
   * @param {UpdateSlot} slot 
   * @returns {void}
   */
  wakeup(slot) {
    this.#resolve(slot);
  }

  /**
   * @returns {void}
   */
  async main() {
    do {
      try {
        const slot = await this.#sleep();
        await slot.waiting(); // queueにデータが入るまで待機
        Main.debug && performance.mark('slot-exec:start');
        try {
          await slot.exec();
          if (Main.debug) {
            performance.mark('slot-exec:end');
            performance.measure('slot-exec', 'slot-exec:start', 'slot-exec:end');
            console.log(performance.getEntriesByType("measure"));    
            performance.clearMeasures();
            performance.clearMarks();
          }
        } finally {
          slot.callback();
        }
      } catch(e) {
        if (e instanceof ThreadStop) {
          break;
        } else {
          console.error(e);
          if (!confirm("致命的なエラーが発生しました。続行しますか？")) {
            break;
          }
        }
      }
    } while(true);

    this.#alive = false;
  }

}

class NotifyReceiver {
  /** @type {PropertyAccess[]} */
  queue = [];

  /** @type {UpdateSlotStatusCallback} */
  #statusCallback;

  /** @type {Component} */
  #component;

  /**
   * @param {Component} component
   * @param {UpdateSlotStatusCallback} statusCallback
   */
  constructor(component, statusCallback) {
    this.#component = component;
    this.#statusCallback = statusCallback;
  }

  /**
   * @returns {void}
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNotifyReceive);
    try {
      while(this.queue.length > 0) {
        const notifies = this.queue.splice(0);
        const dependentPropertyAccesses = [];
        for(const propertyAccess of notifies) {
          dependentPropertyAccesses.push(...ViewModelHandler.makeNotifyForDependentProps(this.#component.viewModel, propertyAccess));
        }
        const setOfUpdatedViewModelPropertyKeys = new Set(
          notifies.concat(dependentPropertyAccesses).map(propertyAccess => propertyAccess.propName.name + "\t" + propertyAccess.indexes.toString())
        );
        this.#component.applyToNode(setOfUpdatedViewModelPropertyKeys);
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNotifyReceive);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */
class UpdateSlot {
  /** @type {ViewModelUpdator} */
  #viewModelUpdator;
  /** @type {ViewModelUpdator} */
  get viewModelUpdator() {
    return this.#viewModelUpdator;
  }

  /** @type {NotifyReceiver} */
  #notifyReceiver;
  /** @type {NotifyReceiver} */
  get notifyReceiver() {
    return this.#notifyReceiver;
  }

  /** @type {NodeUpdator} */
  #nodeUpdator;
  /** @type {NodeUpdator} */
  get nodeUpdator() {
    return this.#nodeUpdator;
  }

  /** @type {()=>void} */
  #callback;

  /** @type {Promise<void>} */
  #waitPromise;

  /** @type {Promise<void>} */
  #alivePromise;

  /** @type {Promise<(value)=>void>} */
  #waitResolve;

  /** @type {Promise<() => void>} */
  #waitReject;

  /** @type {Promise<(value) => void>} */
  #aliveResolve;

  /** @type {Promise<() => void>} */
  #aliveReject;
  
  /**
   * 
   * @param {Component} component
   * @param {()=>{}?} callback
   * @param {UpdateSlotStatusCallback?} statusCallback
   */
  constructor(component, callback = null, statusCallback = null) {
    this.#viewModelUpdator = new ViewModelUpdator(statusCallback);
    this.#notifyReceiver = new NotifyReceiver(component, statusCallback);
    this.#nodeUpdator = new NodeUpdator(statusCallback);
    this.#callback = callback;
    this.#waitPromise = new Promise((resolve, reject) => {
      this.#waitResolve = resolve;
      this.#waitReject = reject;
    });
    this.#alivePromise = new Promise((resolve, reject) => {
      this.#aliveResolve = resolve;
      this.#aliveReject = reject;
    });
  }

  /**
   * 
   * @returns {Promise<void>}
   */
  async waiting() {
    return this.#waitPromise;
  }

  waitResolve(value) {
    this.#waitResolve(value);
  }
  waitReject() {
    this.#waitReject();
  }

  /**
   * 
   * @returns {Promise<void>}
   */
  async alive() {
    return this.#alivePromise;
  }

  async exec() {
    do {
      await this.#viewModelUpdator.exec();
      await this.#notifyReceiver.exec();
      await this.#nodeUpdator.exec();
    } while(!this.#viewModelUpdator.isEmpty || !this.#notifyReceiver.isEmpty || !this.#nodeUpdator.isEmpty);
    this.#aliveResolve();
  }

  /**
   * 
   * @param {ProcessData} processData 
   */
  async addProcess(processData) {
    this.#viewModelUpdator.queue.push(processData);
    this.#waitResolve(true); // waitingを解除する
  }
  
  /**
   * 
   * @param {PropertyAccess} notifyData 
   */
  async addNotify(notifyData) {
    this.#notifyReceiver.queue.push(notifyData);
    this.#waitResolve(true); // waitingを解除する
  }

  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  async addNodeUpdate(nodeUpdateData) {
    this.#nodeUpdator.queue.push(nodeUpdateData);
    this.#waitResolve(true); // waitingを解除する
  }

  /** 
   * @returns {void}
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {Component} component
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns {UpdateSlot}
   */
  static create(component, callback, statusCallback) {
    return new UpdateSlot(component, callback, statusCallback);
  }

}

class AttachShadow {
  /** @type {Set<string>} shadow rootが可能なタグ名一覧 */
  static setOfAttachableTags = new Set([
    // See https://developer.mozilla.org/ja/docs/Web/API/Element/attachShadow
    "articles",
    "aside",
    "blockquote",
    "body",
    "div",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "main",
    "nav",
    "p",
    "section",
    "span",
  ]);

  /**
   * タグ名がカスタム要素かどうか→ダッシュ(-)を含むかどうか
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isCustomTag(tagName) {
    return tagName.indexOf("-") !== -1;
  }

  /**
   * タグ名がshadow rootを持つことが可能か
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isAttachable(tagName) {
    return this.isCustomTag(tagName) || this.setOfAttachableTags.has(tagName);
  }
}

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node[Symbols.isComponent]) return node;
    if (node instanceof ShadowRoot) {
      if (node.host[Symbols.isComponent]) return node.host;
      node = node.host;
    }
  } while(true);
};

const mixInComponent = {
  /** @type {ViewModelProxy} */
  get viewModel() {
    return this._viewModel;
  },
  set viewModel(value) {
    this._viewModel = value;
  },
  /** @type {BindInfo[]} バインドリスト */
  get binds() {
    return this._binds;
  },
  set binds(value) {
    this._binds = value;
  },

  /** @type {Thread} 更新スレッド */
  get thread() {
    return this._thread;
  },
  set thread(value) {
    this._thread = value;
  },

  /** @type {UpdateSlot} 更新処理用スロット */
  get updateSlot() {
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, (updateSlotStatus) => {
        if (updateSlotStatus === UpdateSlotStatus.beginViewModelUpdate) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNotifyReceive) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNodeUpdate) {
          this.viewModel[Symbols.beCacheable]();
        }
      });
      this.thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  },
  // 単体テストのモック用
  set updateSlot(value) {
    this._updateSlot = value;
  },

  /** @type {Object<string,any>} */
  get props() {
    return this._props;
  },

  /** @type {Object<string,any>} */
  get globals() {
    return this._globals;
  },

  /** @type {(...args) => void} */
  get initialResolve() {
    return this._initialResolve;
  },
  set initialResolve(value) {
    this._initialResolve = value;
  },

  /** @type {() => void} */
  get initialReject() {
    return this._initialReject;
  },
  set initialReject(value) {
    this._initialReject = value;
  },

  /** @type {Promise} 初期化確認用プロミス */
  get initialPromise() {
    return this._initialPromise;
  },
  set initialPromise(value) {
    this._initialPromise = value;
  },

  /** @type {(...args) => void} */
  get aliveResolve() {
    return this._aliveResolve;
  },
  set aliveResolve(value) {
    this._aliveResolve = value;
  },

  /** @type {() => void} */
  get aliveReject() {
    return this._aliveReject;
  },
  set aliveReject(value) {
    this._aliveReject = value;
  },

  /** @type {Promise} 生存確認用プロミス */
  get alivePromise() {
    return this._alivePromise;
  },
  set alivePromise(value) {
    this._alivePromise = value;
  },

  /** @type {Component} 親コンポーネント */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  },

  /** @type {boolean} shadowRootを使ってカプセル化をする(true) */
  get withShadowRoot() {
    return this.hasAttribute("with-shadow-root");
  },

  /** @type {ShadowRoot|HTMLElement} viewのルートとなる要素 */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  },

  /**
   * @type {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}}
   */
  get filters() {
    return this._filters;
  },

  /** 
   * 初期化
   * @returns {void}
   */
  initialize() {
    this._viewModel = createViewModel(this, this.constructor.ViewModel);
    this._binds = undefined;
    this._thread = undefined;
    this._updateSlot = undefined;
    this._props = createProps(this);
    this._globals = createGlobals();
    this._initialPromise = undefined;
    this._initialResolve = undefined;
    this._initialReject = undefined;

    this._alivePromise = undefined;
    this._aliveResolve = undefined;
    this._aliveReject = undefined;

    this._parentComponent = undefined;
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this.initialPromise = new Promise((resolve, reject) => {
      this.initialResolve = resolve;
      this.initialReject = reject;
    });
  },

  /**
   * コンポーネント構築処理（connectedCallbackで呼ばれる）
   *   フィルターの設定
   *   シャドウルートの作成
   *   スレッド生成
   *   ViewModel生成、初期化
   *   レンダリング
   * @returns {void}
   */
  async build() {
    const { template, inputFilters, outputFilters } = this.constructor; // staticから取得
    if (typeof inputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(inputFilters)) {
        if (name in this.filters.in) utils.raise(`already exists filter ${name}`);
        this.filters.in[name] = filterFunc;
      }
    }
    if (typeof outputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(outputFilters)) {
        if (name in this.filters.out) utils.raise(`already exists filter ${name}`);
        this.filters.out[name] = filterFunc;
      }
    }
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.withShadowRoot) {
      this.attachShadow({mode: 'open'});
    }
    this.thread = new Thread;

//    this.viewModel = createViewModel(this, ViewModel);
    await this.viewModel[Symbols.initCallback]();

    const initProc = async () => {
      this.binds = View.render(this.viewRootElement, this, template);
      return this.viewModel[Symbols.connectedCallback]();
    };
    const updateSlot = this.updateSlot;
    updateSlot.addProcess(new ProcessData(initProc, this, []));
    await updateSlot.alive();
  },

  /**
   * DOMツリーへ追加時呼ばれる
   * @returns {void}
   */
  async connectedCallback() {
    try {
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }
      this.alivePromise = new Promise((resolve, reject) => {
        this.aliveResolve = resolve;
        this.aliveReject = reject;
      });
      await this.build();
    } finally {
      this.initialResolve && this.initialResolve();
    }
  },

  /**
   * DOMツリーから削除呼ばれる
   * @returns {void}
   */
  disconnectedCallback() {
    this.aliveResolve && this.aliveResolve(this.props[Symbols.toObject]());
  },

  /**
   * 
   * @param {Set<string>} setOfViewModelPropertyKeys 
   */
  applyToNode(setOfViewModelPropertyKeys) {
    this.binds && Binds.applyToNode(this.binds, setOfViewModelPropertyKeys);
  },
};


class ComponentClassGenerator {
  /**
   * 
   * @param {UserComponentModule} componentModule 
   * @returns {class<HTMLElement>}
   */
  static generate(componentModule) {
    const getBaseClass = function (module) {
      return class extends HTMLElement {

        /** @type {HTMLTemplateElement} */
        static template = module.template;

        /** @type {class<typeof ViewModel>} */
        static ViewModel = module.ViewModel;

        /**@type {Object<string,FilterFunc>} */
        static inputFilters = module.inputFilters;

        /** @type {Object<string,FilterFunc>} */
        static outputFilters = module.outputFilters;

        /** @type {boolean} */
        get [Symbols.isComponent] () {
          return true;
        }

        /**
         */
        constructor() {
          super();
          this.initialize();
        }
      };
    };
  
    /** @type {Module} */
    const module = Object.assign(new Module, componentModule);
    // 同じクラスを登録できないため新しいクラスを生成する
    const componentClass = getBaseClass(module);
    if (typeof module.extendClass === "undefined" && typeof module.extendTag === "undefined") ; else {
      // カスタマイズされた組み込み要素
      // extendsを書き換える
      // See http://var.blog.jp/archives/75174484.html
      /** @type {classOf<HTMLElement>} */
      const extendClass = module.extendClass ?? document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // mix in 
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }
    return componentClass;
  }
}
/**
 * 
 * @param {UserComponentModule} componentModule 
 * @returns {Component}
 */
function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}

class Registrar {
  /**
   * 
   * @param {string} name 
   * @param {any} module 
   * @static
   */
  static regist(name, module) {

  }
}

class Util {
  /**
   * to kebab case (upper camel, lower camel, snakeを想定)
   * @param {string} text 
   * @returns {string}
   */
  static toKebabCase = text => (typeof text === "string") ? text.replaceAll(/[\._]/g, "-").replaceAll(/([A-Z])/g, (match,char,index) => (index > 0 ? "-" : "") + char.toLowerCase()) : text;


}

/**
 * @enum {string}
 */
const NameType = {
  kebab: "kebab",
  snake: "snake",
  upperCamel: "uppercamel",
  lowerCamel: "lowercamel",
  dotted: "dotted",
};

class NameTypes {
  /**
   * 
   * @param {string} name 
   * @returns {{
   *  [NameType.kebab]:string,
   *  [NameType.snake]:string,
   *  [NameType.upperCamel]:string,
   *  [NameType.lowerCamel]:string,
   *  [NameType.dotted]:string,
   * }}
   */
  static getNames(name) {
    const kebabName = Util.toKebabCase(name);
    const snakeName = kebabName.replaceAll("-", "_");
    const dottedName = kebabName.replaceAll("-", ".");
    const upperCamelName = kebabName.split("-").map((text, index) => {
      if (typeof text[0] !== "undefined") {
        text = text[0].toUpperCase() + text.slice(1);
      }
      return text;
    }).join("");
    const lowerCamelName = (upperCamelName.length > 0) ? upperCamelName[0].toLowerCase() + upperCamelName.slice(1) : upperCamelName;
    return {
      [NameType.kebab]: kebabName,
      [NameType.snake]: snakeName,
      [NameType.upperCamel]: upperCamelName,
      [NameType.lowerCamel]: lowerCamelName,
      [NameType.dotted]: dottedName,
    }
  }

}

/**
 * @type {NameType}
 */
const DEFAULT_NAME_TYPE = NameType.lowerCamel;
/**
 * @type {string}
 */
const DEAFULT_PATH = "./";

class Config {
  /**
   * @type {NameType} ファイル名に使用するデフォルトの名前の形式（kebab,snake,upperCamel,lowerCamel,dotted）
   * @static
   */
  defaultNameType = DEFAULT_NAME_TYPE;
  /**
   * @type {string} プレフィックスに一致しない場合のパス名、undefinedの場合、ロードせずエラーとする
   * @static
   */
  defaultPath = DEAFULT_PATH;
  /**
   * @type {string[]} ロードする名前の一覧
   * @static
   */
  loadNames = [];
  /**
   * @type {Object<string,string>|undefined} プレフィックスのマップ、キー：名前、値：パス
   * @static
   */
  prefixMap;
}

/**
 * example:
 * myapp-components-main-selector
 * 
 * prefix:
 * myapp-components: ./components/{subName}.js
 *  
 * prefix-name: myapp-components
 * prefix_name: myapp_components
 * PrefixName: MyappComponents
 * prefixName: myappComponents
 * prefix.name: myapp.components
 * 
 * sub-name: main-selector
 * sub_name: main_selector
 * SubName: MainSelector
 * subName: mainSelector
 * sub.name: main.selector
 * 
 * load file:
 * import default from ./components/mainSelector.js
 * 
 * example:
 * myapp-components-main-selector
 * 
 * prefix:
 * myapp-components: ./{PrefixName}.js#{subName}
 *  
 * prefix-name: myapp-components
 * prefix_name: myapp_components
 * PrefixName: MyappComponents
 * prefixName: myappComponents
 * prefix.name: myapp.components
 * 
 * sub-name: main-selector
 * sub_name: main_selector
 * SubName: MainSelector
 * subName: mainSelector
 * sub.name: main.selector
 * 
 * load file:
 * import { mainSelector } from ./components/MyappComponents.js
 */

class Prefix {
  prefix;
  path;
  get matchPrefix() {
    return `${this.prefix}-`;
  }

  /**
   * 
   * @param {string} name
   * @returns {boolean}
   */
  isMatch(name) {
    return name.startsWith(this.matchPrefix);
  }
  
  /**
   * 
   * @param {string} name 名前、kebabケース
   * @returns {{
   * prefixName:string,
   * subName:string,
   * path:string
   * }}
   */
  getNames(name) {
    const {prefix, path} = this;
    if (name.startsWith(this.matchPrefix)) {
      const subName = name.slice(this.matchPrefix.length);
      return { prefixName:prefix, subName, path };
    }
    return;
  }
}

const REPLACE_PREFIX = "prefix-name";
const REPLACE_SUB = "sub-name";

const replacePrefixNames = NameTypes.getNames(REPLACE_PREFIX);
const replaceSubNames = NameTypes.getNames(REPLACE_SUB);

class Path {
  /**
   * 
   * @param {string} path 
   * @param {string} prefixName 
   * @param {string} subName 
   * @param {NameType} defaultNameType
   * @returns {{
   * filePath:string,
   * exportName:string
   * }}
   */
  static getPathInfo(path, prefixName, subName, defaultNameType) {
    const [ filePath, exportName ] = path.split("#");
    let replaceFilePath = filePath;
    let replaceExportName = exportName;
    const prefixNames = NameTypes.getNames(prefixName);
    const subNames = NameTypes.getNames(subName);

    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames[NameType.kebab]}}`, prefixNames[NameType.kebab]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames[NameType.snake]}}`, prefixNames[NameType.snake]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames[NameType.lowerCamel]}}`, prefixNames[NameType.lowerCamel]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames[NameType.upperCamel]}}`, prefixNames[NameType.upperCamel]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames[NameType.dotted]}}`, prefixNames[NameType.dotted]);

    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames[NameType.kebab]}}`, subNames[NameType.kebab]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames[NameType.snake]}}`, subNames[NameType.snake]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames[NameType.lowerCamel]}}`, subNames[NameType.lowerCamel]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames[NameType.upperCamel]}}`, subNames[NameType.upperCamel]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames[NameType.dotted]}}`, subNames[NameType.dotted]);

    if (filePath === replaceFilePath && replaceFilePath.slice(-3) !== ".js") {
      // 変換されなかった場合、パスにファイル名を付加する
      replaceFilePath = replaceFilePath + (path.slice(-1) !== "/" ? "/" : "") + subNames[defaultNameType] + ".js";
    }

    if (replaceExportName) {
      replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames[NameType.kebab]}}`, subNames[NameType.kebab]);
      replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames[NameType.snake]}}`, subNames[NameType.snake]);
      replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames[NameType.lowerCamel]}}`, subNames[NameType.lowerCamel]);
      replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames[NameType.upperCamel]}}`, subNames[NameType.upperCamel]);
      replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames[NameType.dotted]}}`, subNames[NameType.dotted]);
    }
    return {
      filePath: replaceFilePath,
      exportName: replaceExportName
    };

  }
}

/**
 * @typedef {class<Registrar>} RegistrarClass
 */

class Loader {
  /**
   * @type {string}
   */
  #configFile;
  /**
   * @type {Config}
   */
  #config;
  /**
   * @type {Map<string,Prefix>}
   */
  #prefixMap;
  /**
   * @type {RegistrarClass}
   */
  #registrar;

  /**
   * @type {string}
   */
  #location;

  /**
   * 
   * @param {RegistrarClass} registrar 
   */
  constructor(registrar) {
    this.#registrar = registrar;
    this.#location = window.location;
    this.setConfig(new Config);
  }

  /**
   * configの設定
   * @param {Object<string,string>} config 
   */
  setConfig(config) {
    this.#config = Object.assign(new Config, config);
    if ("prefixMap" in config && typeof config.prefixMap !== "undefined") {
      this.setPrefixMap(config.prefixMap);
    }
  }

  /**
   * configの取得
   * @returns {Config}
   */
  getConfig() {
    return this.#config;
  }

  /**
   * prefixMapの設定
   * @param {Object<string,string>} prefixMap 
   * @returns {Loader}
   */
  setPrefixMap(prefixMap) {
    this.#prefixMap = new Map(Object.entries(prefixMap).map(
      ([prefix, path]) => {
        prefix = Util.toKebabCase(prefix);
        return [prefix, Object.assign(new Prefix, {prefix, path})];
      }
    ));
  }

  /**
   * prefixMapの取得
   * @returns {Map<string,string>}
   */
  getPrefixMap() {
    return this.#prefixMap;
  }

  /**
   * configファイルの設定
   * メソッドチェーン
   * @param {string} configFile 
   * @returns {Loader}
   */
  configFile(configFile) {
    this.#configFile = configFile;
    return this;
  }

  /**
   * configの設定
   * メソッドチェーン
   * @param {Object<string,string>} config 
   * @returns {Main}
   */
  config(config) {
    this.setConfig(config);
    return this;
  }

  /**
   * prefixMapの設定
   * メソッドチェーン
   * @param {Object<string,string>} prefixMap 
   * @returns {Loader}
   */
  prefixMap(prefixMap) {
    this.setPrefixMap(prefixMap);
    return this;
  }

  /**
   * @type {Registrar}
   */
  get registrar() {
    return this.#registrar;
  }

  /**
   * 
   * @param {string} configFile 
   * @returns 
   */
  async loadConfig(configFile) {
    // コンフィグをファイルから読み込む
    const paths = this.#location.pathname.split("/");
    paths[paths.length - 1] = configFile;
    const fullPath = this.#location.origin + paths.join("/");

    try {
      const response = await fetch(fullPath);
      const config = await response.json();
      return Object.assign(new Config, config);
    } catch(e) {
      throw new Error(e);
    }
  }
  /**
   * 
   * @param  {...string} loadNames 
   */
  async load(...loadNames) {
    if (typeof this.#configFile !== "undefined") {
      const config = await this.loadConfig(this.#configFile);
      this.setConfig(config);
    }
    if (typeof this.#prefixMap === "undefined") {
      throw new Error(`prefixMap is not defined`);
    }
    if (typeof this.#registrar === "undefined") {
      throw new Error(`registrar is not defined`);
    }
    const prefixes = Array.from(this.#prefixMap.values());
    const { defaultNameType, defaultPath } = this.#config;
    loadNames = (loadNames.length > 0) ? loadNames : this.#config.loadNames;
    for(let loadName of loadNames) {
      loadName = Util.toKebabCase(loadName);
      let loadPaths;
      const prefix = prefixes.find(prefix => prefix.isMatch(loadName));
      if (typeof prefix !== "undefined") {
        const names = prefix.getNames(loadName);
        loadPaths = Path.getPathInfo(names.path, names.prefixName, names.subName, defaultNameType);
      }
      if (typeof loadPaths === "undefined" && typeof defaultPath !== "undefined") {
        loadPaths = Path.getPathInfo(defaultPath, "", loadName, defaultNameType);
      }
      if (typeof loadPaths === "undefined") {
        throw new Error(`unmatch prefix and no defaultPath (loadName:${loadName})`);
      }

      const paths = this.#location.pathname.split("/");
      paths[paths.length - 1] = loadPaths.filePath;
      const importPath = this.#location.origin + paths.join("/");

      let module;
      try {
        module = await import(importPath);
      } catch(e) {
        throw new Error(e);
      }
      let moduleData;
      if (typeof loadPaths.exportName !== "undefined") {
        if (!(loadPaths.exportName in module)) {
          throw new Error(`${loadPaths.exportName} not found in module (exportName:${loadPaths.exportName}, ${loadPaths.filePath})`);
        }
        moduleData = module[loadPaths.exportName];
      } else {
        moduleData = module.default;
      }
      this.#registrar.regist(loadName, moduleData);
    }
    return this;
  }

  /**
   * 
   * @param {RegistrarClass} registrar 
   * @returns {Loader}
   */
  static create(registrar) {
    return new Loader(registrar);
  }

}

class QuelModuleRegistrar extends Registrar {
  /**
   * 
   * @param {string} name 
   * @param {Object<string,any>} module 
   * @returns {void}
   */
  static regist(name, module) {
    if (name.startsWith("filter-")) {
      const filterName = name.slice("filter-".length);
      const { output, input } = module;
      Filter.regist(filterName, output, input);
    } else {
      Main.registComponentModule(name, module);
    }
  }
}

const loader = Loader.create(QuelModuleRegistrar);

function registComponentModules(components) {
  Main.componentModules(components);
}

function registConfig(config) {
  Main.config(config);
}

export { Main as default, generateComponentClass, loader, registComponentModules, registConfig };
