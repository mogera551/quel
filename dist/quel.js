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

class outputFilters {
  static localeString = (value, options) => (value != null) ? Number(value).toLocaleString() : null;
  static fixed        = (value, options) => (value != null) ? Number(value).toFixed(options[0] ?? 0) : null;
  static styleDisplay = (value, options) => value ? (options[0] ?? "") : "none";
  static truthy       = (value, options) => value ? true : false;
  static falsey       = (value, options) => !value ? true : false;
  static not          = this.falsey;
  static upperCase    = (value, options) => (value != null) ? String(value).toUpperCase() : null;
  static lowerCase    = (value, options) => (value != null) ? String(value).toLowerCase() : null;
  static eq           = (value, options) => value == options[0];
  static ne           = (value, options) => value != options[0];
  static lt           = (value, options) => Number(value) < Number(options[0]);
  static le           = (value, options) => Number(value) <= Number(options[0]);
  static gt           = (value, options) => Number(value) > Number(options[0]);
  static ge           = (value, options) => Number(value) >= Number(options[0]);
  static embed        = (value, options) => (value != null) ? decodeURIComponent((options[0] ?? "").replaceAll("%s", value)) : null;
  static ifText       = (value, options) => value ? options[0] ?? null : options[1] ?? null;
  static null         = (value, options) => (value == null) ? true : false;
}

class inputFilters {
  static number       = (value, options) => value === "" ? null : Number(value);
  static boolean      = (value, options) => value === "" ? null : Boolean(value);
}

// "property:vmProperty|toFix,2|toLocaleString;"
// => toFix,2|toLocaleString

class Filter {
  /**
   * @type {string}
   */
  name;
  /**
   * @type {string[]}
   */
  options;

  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForInput(value, filters) {
    return filters.reduceRight((v, f) => (f.name in inputFilters) ? inputFilters[f.name](v, f.options) : v, value);
  }
  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForOutput(value, filters) {
    return filters.reduce((v, f) => (f.name in outputFilters) ? outputFilters[f.name](v, f.options) : v, value);
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

/**
 * @enum {number}
 */
const NodePropertyType = {
  levelTop: 1,
  level2nd: 2,
  level3rd: 3,
  attribute: 5,
  className: 10,
  radio: 20,
  checkbox: 30,
  event: 91,
  component: 92,
  template: 95,
};

const TEMPLATE_BRANCH = "if"; // 条件分岐
const TEMPLATE_REPEAT = "loop"; // 繰り返し

const name = "quel";

const WILDCARD = "*";
const DELIMITER = ".";
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
    this.pathNames = name.split(DELIMITER);
    this.parentPathNames = this.pathNames.slice(0, -1);
    this.parentPaths = this.parentPathNames.reduce((paths, pathName) => { 
      paths.push(paths.at(-1)?.concat(pathName) ?? [pathName]);
      return paths;
    }, []).map(paths => paths.join("."));
    this.setOfParentPaths = new Set(this.parentPaths);
    this.parentPath = this.parentPathNames.join(DELIMITER);
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

let Handler$3 = class Handler {
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
    if (propName.nearestWildcardName === propName.name) {
      // propName末尾が*の場合
      setFunc({propName:listProp, indexes}, values);
    } else {
      if (values.length !== listValues.length) throw new Error(`not match array count '${propName.name}'`);
      for(let i in listValues) {
        setFunc({propName, indexes:indexes.concat(Number(i))}, values[i]);
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
  isProxy: Symbol.for(`${name}:arrayHandler.isProxy`),
  getRaw: Symbol.for(`${name}:arrayHandler.raw`),
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

class NodePropertyInfo {
  /**
   * @type {NodePropertyType}
   */
  type;
  /**
   * @type {string[]}
   */
  nodePropertyElements = [];
  /**
   * @type {string}
   */
  eventType;

  /**
   * 
   * @param {Node} node
   * @param {string} nodeProperty 
   * @returns {NodePropertyInfo}
   */
  static get(node, nodeProperty) {
    const result = new NodePropertyInfo;
    result.nodePropertyElements = nodeProperty.split(".");
    if (node instanceof Comment && node.textContent[2] === "|") {
      if (nodeProperty === TEMPLATE_BRANCH || nodeProperty === TEMPLATE_REPEAT) {
        result.type = NodePropertyType.template;
        return result;
      }
    }    
    if (node[Symbols.isComponent] && result.nodePropertyElements[0] === "$props") { 
      result.type = NodePropertyType.component;
      return result;
    }    if (result.nodePropertyElements.length === 1) {
      if (result.nodePropertyElements[0].startsWith(PREFIX_EVENT)) {
        result.type = NodePropertyType.event;
        result.eventType = result.nodePropertyElements[0].slice(PREFIX_EVENT.length);
      } else if (result.nodePropertyElements[0] === "radio") {
        result.type = NodePropertyType.radio;
      } else if (result.nodePropertyElements[0] === "checkbox") {
        result.type = NodePropertyType.checkbox;
      } else {
        result.type = NodePropertyType.levelTop;
      }
    } else if (result.nodePropertyElements.length === 2) {
      if (result.nodePropertyElements[0] === "className") {
        result.type = NodePropertyType.className;
      } else if (result.nodePropertyElements[0] === "attr") {
        result.type = NodePropertyType.attribute;
      } else {
        result.type = NodePropertyType.level2nd;
      }
    } else if (result.nodePropertyElements.length === 3) {
      result.type = NodePropertyType.level3rd;
    } else {
      utils.raise(`unknown property ${nodeProperty}`);
    }
    return result;
  }
}

class BindInfo {
  /**
   * @type {Node}
   */
  #node;
  get node() {
    return this.#node;
  }
  set node(node) {
    this.#node = node;
  }
  /**
   * @type {Element}
   */
  get element() {
    return (this.node instanceof Element) ? this.node : utils.raise("not Element");
  }
  /**
   * @type {string}
   */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(value) {
    this.#nodeProperty = value;
  }

  /**
   * @type {string[]}
   */
  #nodePropertyElements;
  get nodePropertyElements() {
    return this.#nodePropertyElements;
  }
  set nodePropertyElements(value) {
    this.#nodePropertyElements = value;
  }

  /**
   * @type {Component} 
   */
  component;
  /**
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {string}
   */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }
  set viewModelProperty(value) {
    this.#viewModelProperty = value;

    this.#viewModelPropertyName = undefined;
    this.#isContextIndex = undefined;
    this.#contextIndex = undefined;
    this.#contextParam = undefined;
    this.#indexes = undefined;
    this.#indexesString = undefined;
    this.#viewModelPropertyKey = undefined;
  }
  /**
   * @type {PropertyName}
   */
  #viewModelPropertyName;
  get viewModelPropertyName() {
    if (typeof this.#viewModelPropertyName === "undefined") {
      this.#viewModelPropertyName = PropertyName.create(this.#viewModelProperty);
    }
    return this.#viewModelPropertyName;
  }
  /**
   * @type {number}
   */
  #contextIndex;
  get contextIndex() {
    if (typeof this.#contextIndex === "undefined") {
      if (this.isContextIndex === true) {
        this.#contextIndex = Number(this.viewModelProperty.slice(1)) - 1;
      }
    }
    return this.#contextIndex;
  }
  /**
   * @type {boolean}
   */
  #isContextIndex;
  get isContextIndex() {
    if (typeof this.#isContextIndex === "undefined") {
      this.#isContextIndex = (RE_CONTEXT_INDEX.exec(this.viewModelProperty)) ? true : false;
    }
    return this.#isContextIndex;
  }
  /**
   * @type {Filter[]}
   */
  filters;

  #contextParam;
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = this.viewModelPropertyName;
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      }
    }
    return this.#contextParam;
  }

  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.contextParam?.indexes ?? [];
    }
    return this.#indexes;
  }
  set indexes(value) {
//    this.#indexes = value;
//    this.#indexesString = value.toString();
//    this.#viewModelPropertyKey = this.#viewModelProperty + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    if (typeof this.#indexesString === "undefined") {
      this.#indexesString = this.indexes.toString();
    }
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    if (typeof this.#viewModelPropertyKey === "undefined") {
      this.#viewModelPropertyKey = this.viewModelProperty + "\t" + this.indexesString;
    }
    return this.#viewModelPropertyKey;
  }
  /**
   * @type {number[]}
   */
  get contextIndexes() {
    return this.context.indexes;
  }
  
  /**
   * @type {any}
   */
  lastNodeValue;
  /**
   * @type {any}
   */
  lastViewModelValue;

  /**
   * @type {ContextInfo}
   */
  context;

  /**
   * 
   * @returns {any}
   */
  getViewModelValue() {
    return (this.isContextIndex) ?
      this.contextIndexes[this.contextIndex] :
      this.viewModel[Symbols.directlyGet](this.viewModelProperty, this.indexes);
  }

  /**
   * 
   * @param {any} value
   */
  setViewModelValue(value) {
    if (!this.isContextIndex) {
      this.viewModel[Symbols.directlySet](this.viewModelProperty, this.indexes, value);
    }
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
   * 
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
  }

  /**
   * 
   */
  removeFromParent() { }
}

/**
 * @enum {number}
 */
const UpdateSlotStatus = {
  beginViewModelUpdate: 1,
  endViewMmodelUpdate: 2,
  beginNotifyReceive: 3,
  endNotifyReceive: 4,
  beginNodeUpdate: 5,
  endNodeUpdate: 6,
};

class NodeUpdateData {
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {string}
   */
  property;
  viewModelProperty;
  value;
  /**
   * @type {()=>{}}
   */
  updateFunc;

  /**
   * 
   * @param {Node} node 
   * @param {string} property 
   * @param {()=>{}} updateFunc 
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
  /**
   * @type {NodeUpdateData[]}
   */
  queue = [];

  /**
   * @type {UpdateSlotStatusCallback}
   */
  #statusCallback;
  /**
   * @param {UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   * @param {NodeUpdateData[]} updates 
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
   * 
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

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

class LevelTop extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, nodeProperty, filters} = this;
    const value = Filter.applyForInput(node[nodeProperty], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}

class Level2nd extends BindInfo {
  get nodeProperty1() {
    return this.nodePropertyElements[0];
  }
  get nodeProperty2() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty1][nodeProperty2] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}

class Level3rd extends BindInfo {
  get nodeProperty1() {
    return this.nodePropertyElements[0];
  }
  get nodeProperty2() {
    return this.nodePropertyElements[1];
  }
  get nodeProperty3() {
    return this.nodePropertyElements[2];
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty1][nodeProperty2][nodeProperty3] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2][nodeProperty3], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}

class AttributeBind extends BindInfo {
  /**
   * @type {string}
   */
  get attrName() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, attrName, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, value, () => {
        element.setAttribute(attrName, value ?? "");
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {element, attrName, filters} = this;
    const value = Filter.applyForInput(element.getAttribute(attrName), filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}

class ClassName extends BindInfo {
  /**
   * @type {string}
   */
  get className() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, nodeProperty, viewModelProperty, filters, className} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        value ? element.classList.add(className) : element.classList.remove(className);
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, element, filters, className} = this;
    const value = Filter.applyForInput(element.classList.contains(className), filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}

const toHTMLInputElement$1 = node => (node instanceof HTMLInputElement) ? node : utils.raise();

class Radio extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const radio = toHTMLInputElement$1(node);
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        radio.checked = value === radio.value;
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const radio = toHTMLInputElement$1(node);
    const radioValue = Filter.applyForInput(radio.value, filters);
    if (radio.checked) {
      this.setViewModelValue(radioValue);
      this.lastViewModelValue = radioValue;
    }
  }
}

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise('not HTMLInputElement');

class Checkbox extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        checkbox.checked = value.find(value => value === checkbox.value);
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const checkboxValue = Filter.applyForInput(checkbox.value, filters);
    const setOfValue = new Set(this.getViewModelValue());
    (checkbox.checked) ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
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
  let routeIndexes = [];
  while(node.parentNode != null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node) ].concat(routeIndexes);
    node = node.parentNode;
  }
  return routeIndexes;
};


/**
 * 
 * @param {Node} node 
 * @returns 
 */
const isCommentNode = node => node instanceof Comment && (node.textContent.startsWith("@@:") || node.textContent.startsWith("@@|"));
/**
 * 
 * @param {Node} node 
 * @returns {Comment[]}
 */
const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : null)).filter(node => node);

class Selector {
  /**
   * @type {Map<HTMLTemplateElement, number[][]>}
   */
  static listOfRouteIndexesByTemplate = new Map();
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement
   * @returns {Node[]}
   */
  static getTargetNodes(template, rootElement) {
    /**
     * @type {Node[]}
     */
    let nodes;

    if (this.listOfRouteIndexesByTemplate.has(template)) {
      // キャッシュがある場合
      // querySelectorAllを行わずにNodeの位置を特定できる
      const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
      nodes = listOfRouteIndexes.map(routeIndexes => routeIndexes.reduce((node, routeIndex) => node.childNodes[routeIndex], rootElement));
    } else {
      // data-bind属性を持つエレメント、コメント（内容が@@で始まる）のノードを取得しリストを作成する
      nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));

      // ノードのルート（DOMツリーのインデックス番号の配列）をキャッシュに覚えておく
      this.listOfRouteIndexesByTemplate.set(template, nodes.map(node => getNodeRoute(node)));
    }
    return nodes;

  }

}

class Context {

  /**
   * @returns {ContextInfo}
   */
  static create() {
    return {
      indexes: [],
      stack: [],
    }
  }
  /**
   * 
   * @param {ContextInfo} src 
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
  /**
   * @type {Map<string,HTMLTemplateElement>}
   */
  static templateByUUID = new Map;

}

class TemplateChild {
  /**
   * @type {BindInfo[]}
   */
  binds;
  /**
   * @type {Node[]}
   */
  childNodes;
  /**
   * @type {DocumentFragment}
   */
  fragment;

  /**
   * @type {ContextInfo}
   */
  context;
  /**
   * @type {Node}
   */
  get lastNode() {
    return this.childNodes[this.childNodes.length - 1];
  }
  /**
   * @type {node[]|DocumentFragment}
   */
  get nodesForAppend() {
    return this.fragment.childNodes.length > 0 ? [this.fragment] : this.childNodes;
  }

  /**
   * 
   */
  removeFromParent() {
    this.childNodes.forEach(node => node.parentNode?.removeChild(node));
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
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
    const changedParam = this.context.stack.find(param => param.propName.name === propName.name);
    if (changedParam) {
      this.context.indexes[changedParam.pos] += diff;
      const paramPos = changedParam.indexes.length - 1;
      changedParam.indexes[paramPos] += diff;
      this.context.stack.filter(param => param.propName.setOfParentPaths.has(propName.name)).forEach(param => {
        param.indexes[paramPos] += diff;
      });
    }
    this.binds.forEach(bind => bind.changeIndexes(propName, diff));
  }

  /**
   * 
   * @param {Template} templateBind 
   * @param {ContextInfo} context
   * @returns {TemplateChild}
   */
  static create(templateBind, context) {
    const {component, template} = templateBind;
    const rootElement = document.importNode(template.content, true);
    const nodes = Selector.getTargetNodes(template, rootElement);
    const binds = Binder.bind(nodes, component, context);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes, fragment:rootElement, context });
  }
}

class TemplateBind extends BindInfo {
  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];
  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Templates.templateByUUID.get(this.uuid);
    }
    return this.#template;
  }
  /**
   * @type {string}
   */
  #uuid;
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = this.node.textContent.slice(3);
    }
    return this.#uuid;
  }

  updateNode() {
    const newValue = (this.nodeProperty === TEMPLATE_REPEAT) ? this.expandLoop() : 
      (this.nodeProperty === TEMPLATE_BRANCH) ? this.expandIf() : utils.raise(`unknown property ${this.nodeProperty}`);
    this.lastViewModelValue = (newValue instanceof Array) ? newValue.slice() : newValue;
  }
  
  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.forEach(child => child.removeFromParent());
  }

  /**
   * 
   */
  appendToParent() {
    const fragment = document.createDocumentFragment();
    this.templateChildren
      .forEach(child => fragment.appendChild(...child.nodesForAppend));
    this.node.after(fragment);
  }

  /**
   * 
   * @returns {any} newValue
   */
  expandIf() {
    const { filters, context } = this;
    const lastValue = this.lastViewModelValue;
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (lastValue !== newValue) {
      this.removeFromParent();
      if (newValue) {
        this.templateChildren = [TemplateChild.create(this, context)];
        this.appendToParent();
      } else {
        this.templateChildren = [];
      }
    }

    // 子要素の展開を実行
    this.templateChildren.forEach(templateChild => templateChild.updateNode());

    return newValue;
  }

  /**
   * @returns {any[]} newValue
   */
  expandLoop() {
    const { filters, templateChildren, context } = this;
    /**
     * @type {any[]}
     */
    const lastValue = this.lastViewModelValue ?? [];
    /**
     * @type {any[]}
     */
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters) ?? [];

    /**
     * @type {Map<any,number[]>}
     */
    const indexesByLastValue = lastValue.reduce((map, value, index) => {
      map.get(value)?.push(index) ?? map.set(value, [ index ]);
      return map;
    }, new Map);
    /**
     * @type {Map<number,number>}
     */
    const lastIndexByNewIndex = new Map;
    const moveOrCreateIndexes = [];

    // コンテキスト用のデータ
    const pos = context.indexes.length;
    const propName = this.viewModelPropertyName;
    const parentIndexes = this.contextParam?.indexes ?? [];

    // 新しくテンプレート子要素のリストを作成する
    /**
     * @type {TemplateChild[]}
     */
    const newTemplateChildren = newValue.map((value, newIndex) => {
      const lastIndexes = indexesByLastValue.get(value);
      if (typeof lastIndexes === "undefined" || lastIndexes.length === 0) {
        // 元のインデックスがない場合、新規
        lastIndexByNewIndex.set(newIndex, undefined);
        moveOrCreateIndexes.push(newIndex);
        const newContext = Context.clone(context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos});
        return TemplateChild.create(this, newContext);
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndexes(this.viewModelPropertyName, newIndex - lastIndex);
        const prevLastIndex = lastIndexByNewIndex.get(newIndex - 1);
        if (typeof prevLastIndex === "undefined" || prevLastIndex > lastIndex) {
          moveOrCreateIndexes.push(newIndex);
        }
        return templateChild;
      }
    });
    // 削除対象、追加・移動対象のインデックスを取得し、ノードを削除
    for(const indexes of indexesByLastValue.values()) {
      for(const index of indexes) {
        templateChildren[index].removeFromParent();
      }
    }

    moveOrCreateIndexes.forEach(moveOrCreateIndex => {
      const templateChild = newTemplateChildren[moveOrCreateIndex];
      const beforeNode = newTemplateChildren[moveOrCreateIndex - 1]?.lastNode ?? this.node;
      beforeNode.after(...templateChild.nodesForAppend);
    });

    // 子要素の展開を実行
    newTemplateChildren.forEach(templateChild => templateChild.updateNode());

    this.templateChildren = newTemplateChildren;

    return newValue;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
    super.changeIndexes(propName, diff);
    this.templateChildren.forEach(templateChild => templateChild.changeIndexes(propName, diff));
  }
}

class ProcessData {
  /**
   * @type {()=>{}}
   */
  target;
  /**
   * @type {Object}
   */
  thisArgument;
  /**
   * @type {any[]}
   */
  argumentsList;

  /**
   * 
   * @param {()=>{}} target 
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
  /**
   * @type {ProcessData[]}
   */
  queue = [];

  /**
   * @type {UpdateSlotStatusCallback}
   */
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

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

class Event extends BindInfo {
  #eventType;
  /**
   * @type {string}
   */
  get eventType() {
    return this.#eventType;
  }
  set eventType(value) {
    this.#eventType = value;
  }
  /**
   * 
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
  /**
   * @type {Node}
   */
  get node() {
    return super.node;
  }
  set node(node) {
    this.thisComponent = toComponent(node);
    super.node = node;
  }
  #isSetProperty() {
    return (typeof this.viewModelProperty !== "undefined" && typeof this.nodePropertyElements !== "undefined");
  }
  /**
   * @type {string}
   */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }
  /**
   * @type {string[]}
   */
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.#isSetProperty()) {
      this.bindProperty();
    }
  }
  /**
   * @type {string}
   */
  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }
  /**
   * @type {string}
   */
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  #thisComponent;
  get thisComponent() {
    return this.#thisComponent;
  }
  set thisComponent(value) {
    this.#thisComponent = value;
  }

  /**
   * 
   */
  bindProperty() {
    this.thisComponent.props[Symbols.bindProperty](this.dataProperty, this.viewModelProperty, this.indexes);
  }

  /**
   * 
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  applyToNode(setOfUpdatedViewModelPropertyKeys) {
    const { viewModelProperty, dataProperty } = this;
    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const [ name, indexesString ] = key.split("\t");
      const propName = PropertyName.create(name);
      if (name === viewModelProperty || propName.setOfParentPaths.has(viewModelProperty)) {
        const remain = name.slice(viewModelProperty.length);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${dataProperty}${remain}`, ((indexesString || null)?.split(",") ?? []).map(i => Number(i)));
      }
    }
  }

  /**
   * 
   */
  updateNode() {
//    const { node, dataProperty } = this;
//    this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${dataProperty}`, []);
  }

  updateViewModel() {
  }

}

const createLevelTop = (bindInfo, info) => Object.assign(new LevelTop, bindInfo, info);
const createLevel2nd = (bindInfo, info) => Object.assign(new Level2nd, bindInfo, info);
const createLevel3rd = (bindInfo, info) => Object.assign(new Level3rd, bindInfo, info);
const createAttributeBind = (bindInfo, info) => Object.assign(new AttributeBind, bindInfo, info);
const createClassName = (bindInfo, info) => Object.assign(new ClassName, bindInfo, info);
const createRadio = (bindInfo, info) => Object.assign(new Radio, bindInfo, info);
const createCheckbox = (bindInfo, info) => Object.assign(new Checkbox, bindInfo, info);
const createTemplateBind = (bindInfo, info) => Object.assign(new TemplateBind, bindInfo, info);
const createEvent = (bindInfo, info) => Object.assign(new Event, bindInfo, info);
const createComponent = (bindInfo, info) => Object.assign(new ComponentBind, bindInfo, info);

const creatorByType = new Map();
creatorByType.set(NodePropertyType.levelTop, createLevelTop);
creatorByType.set(NodePropertyType.level2nd, createLevel2nd);
creatorByType.set(NodePropertyType.level3rd, createLevel3rd);
creatorByType.set(NodePropertyType.attribute, createAttributeBind);
creatorByType.set(NodePropertyType.className, createClassName);
creatorByType.set(NodePropertyType.radio, createRadio);
creatorByType.set(NodePropertyType.checkbox, createCheckbox);
creatorByType.set(NodePropertyType.template, createTemplateBind);
creatorByType.set(NodePropertyType.event, createEvent);
creatorByType.set(NodePropertyType.component, createComponent);

class Factory {
  /**
   * 
   * @param {{
   * component:Component,
   * node:Node,
   * nodeProperty:string,
   * viewModel:ViewModel,
   * viewModelProperty:string,
   * filters:Filter[],
   * context:ContextInfo
   * }}
   * @returns {BindInfo}
   */
  static create({component, node, nodeProperty, viewModel, viewModelProperty, filters, context}) {
    const bindData = {
      component, node, nodeProperty, viewModel, viewModelProperty, filters, context
    };
    const nodeInfo = NodePropertyInfo.get(node, nodeProperty);
    /**
     * @type {BindInfo}
     */
    const bindInfo = creatorByType.get(nodeInfo.type)(bindData, nodeInfo);
    if (bindInfo.viewModelPropertyName.level > 0 && bindInfo.indexes.length == 0) {
      utils.raise(`${bindInfo.viewModelPropertyName.name} be outside loop`);
    }
    return bindInfo;
  }
}

const SAMENAME = "@";
const DEFAULT = "$";

class BindTextInfo {
  /**
   * @type {string}
   */
  nodeProperty;
  /**
   * @type {string}
   */
  viewModelProperty;
  /**
   * @type {Filter[]}
   */
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
 * @returns {{nodeProperty:string,viewModelProp:string,filters:Filter[]}}
 */
const parseExpression = (expr, defaultName) => {
  const [nodeProperty, viewModelPropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { viewModelProperty, filters } = parseViewModelProperty(viewModelPropertyText);
  return { nodeProperty, viewModelProperty, filters };
};

/**
 * 属性値のパース
 * @param {string} text 属性値
 * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {{prop:string,viewModelProp:string,filters:Filter[]}[]}
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
  /**
   * @type {Map<string,BindTextInfo[]>}
   */
  static bindTextsByKey = new Map();

  /**
   * 属性値のパース
   * @param {string} text 属性値
   * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
   * @returns {BindTextInfo[]}
   */
  static parse(text, defaultName) {
    const key = text + "\t" + defaultName;
    let binds = this.bindTextsByKey.get(key);
    if (typeof binds === "undefined") {
      binds = parseBindText(text, defaultName).map(bind => Object.assign(new BindTextInfo, bind));
      this.bindTextsByKey.set(key, binds);
    }
    return binds;
  }
}

class BindToDom {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {Object<string,any>} viewModel 
   * @param {ContextInfo} context
   * @returns {(text:string, defaultName:string)=> BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, context) => 
    (text, defaultName) => 
      Parser.parse(text, defaultName)
        .map(info => Factory.create(Object.assign(info, {node, component, viewModel, context})));

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
}

const DATASET_BIND_PROPERTY$1 = "bind";
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
 * 
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : "value") : 
  DEFAULT_PROPERTY$1;
};

/**
 * 
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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    const viewModel = component.viewModel;
    const element = toHTMLElement(node);
    const bindText = element.dataset[DATASET_BIND_PROPERTY$1];
    const defaultName = getDefaultProperty(element);

    // パース
    const parseBindText = BindToDom.parseBindText(node, component, viewModel, context);
    const binds = parseBindText(bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    let hasDefaultEvent = false;
    /**
     * @type {BindInfo}
     */
    let defaultBind = null;
    let radioBind = null;
    let checkboxBind = null;
    binds.forEach(bind => {
      hasDefaultEvent ||= bind.nodeProperty === DEFAULT_EVENT;
      radioBind = (bind instanceof Radio) ? bind : radioBind;
      checkboxBind = (bind instanceof Checkbox) ? bind : checkboxBind;
      defaultBind = (bind.nodeProperty === defaultName) ? bind : defaultBind;
      toEvent$1(bind)?.addEventListener();
    });

    const setDefaultEventHandler = (bind) => {
      element.addEventListener(DEFAULT_EVENT_TYPE, (event) => {
        event.stopPropagation();
        const process = new ProcessData(bind.updateViewModel, bind, []);
        component.updateSlot.addProcess(process);
      });
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

const DATASET_BIND_PROPERTY = "bind";

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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    const viewModel = component.viewModel;
    const element = toSVGElement(node);
    const bindText = element.dataset[DATASET_BIND_PROPERTY];
    const defaultName = undefined;

    // パース
    const parseBindText = BindToDom.parseBindText(node, component, viewModel, context);
    const binds = parseBindText(bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    /**
     * @type {BindInfo}
     */
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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    // コメントノードをテキストノードに差し替える
    const viewModel = component.viewModel;
    const comment = toComment$1(node);
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    const parseBindText = BindToDom.parseBindText(textNode, component, viewModel, context);
    const binds = parseBindText(bindText, DEFAULT_PROPERTY);
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }

}

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise("not Comment");

class BindToTemplate {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    const viewModel = component.viewModel;
    const comment = toComment(node);
    const uuid = comment.textContent.slice(3);
    const template = Templates.templateByUUID.get(uuid);
    const bindText = template.dataset.bind;

    // パース
    const parseBindText = BindToDom.parseBindText(node, component, viewModel, context);
    let binds = parseBindText(bindText, undefined);
    binds = binds.length > 0 ? [ binds[0] ] : [];
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }
}

class Binder {
  /**
   * 
   * @param {Node[]} nodes
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(nodes, component, context) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(node, component, context) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(node, component, context) :
      (node instanceof SVGElement) ? BindToSVGElement.bind(node, component, context) :
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(node, component, context) : 
      utils.raise(`unknown node type`)
    );
  }

}

class View {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @returns 
   */
  static render(rootElement, component, template) {
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    const binds = Binder.bind(nodes, component, Context.create());
    rootElement.appendChild(content);
    return binds;
  }
}

class Cache {
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
   * 
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
   * @param {any} target 
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
   * @param {any} target 
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
      this.viewModelInfoByConstructor.set(viewModelConstructor, viewModelInfo);    }
    viewModelInfo.removeProps.forEach(propertyKey => Reflect.deleteProperty(target, propertyKey));
    return {
      definedProps:viewModelInfo.definedProps, 
      methods:viewModelInfo.methods, 
      accessorProps:viewModelInfo.accessorProps,
      viewModel:target
    };
  }

  /**
   * @type {Map<class.constructor,ViewModelInfo>}
   */
  static viewModelInfoByConstructor = new Map;
  
}

/**
 * 配列プロキシ
 * 更新（追加・削除）があった場合、更新コールバックを呼び出す
 */
let Handler$2 = class Handler {
  #updateCallback;
  get updateCallback() {
    return this.#updateCallback;
  }
  /**
   * コンストラクタ
   * @param {()=>{}} updateCallback
   */
  constructor(updateCallback) {
    this.#updateCallback = updateCallback;
  }

  /**
   * getter
   * SymIsProxyはtrueを返す
   * SymRawは元の配列を返す
   * @param {Array} target Array
   * @param {string} prop プロパティ
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.isProxy) return true;
    if (prop === Symbols.getRaw) return target;
    return Reflect.get(target, prop, receiver);
  }

  /**
   * setter
   * 更新があった場合、lengthがsetされる
   * @param {Object} target Array
   * @param {string} prop プロパティ
   * @param {Any} value 
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    if (prop === "length") {
      this.updateCallback();
    }
    return true;
  }
};

/**
 * 
 * @param {any[]} array
 * @param {()=>{}} updateCallback
 * @returns 
 */
function create(array, updateCallback) {
  return new Proxy(array, new Handler$2(updateCallback))
}

class DependentProps {
  #setOfDefaultProps = new Set;
  /**
   * @type {Map<string,Set<string>>}
   */
  #setOfPropsByRefProp = new Map;
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

/**
 * @type {Set<string>}
 */
const setOfProperties = new Set([
  PROPS_PROPERTY,
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  OPEN_DIALOG_METHOD,
  CLOSE_DIALOG_METHOD,
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
class ViewModelHandler extends Handler$3 {
  /**
   * @type {Component}
   */
  #component;
  get component() {
    return this.#component;
  }
  /**
   * @type {Cache}
   */
  #cache = new Cache;
  get cache() {
    return this.#cache;
  }
  /**
   * @type {string[]}
   */
  #methods;
  get methods() {
    return this.#methods;
  }
  /**
   * @type {string[]}
   */
  #accessorProperties;
  get accessorProperties() {
    return this.#accessorProperties;
  }
  #setOfAccessorProperties;
  get setOfAccessorProperties() {
    return this.#setOfAccessorProperties;
  }

  /**
   * @type {DependentProps}
   */
  #dependentProps = new DependentProps
  get dependentProps() {
    return this.#dependentProps;
  }

  /**
   * @type {boolean}
   */
  #cacheable = false;
  get cacheable() {
    return this.#cacheable;
  }
  set cacheable(value) {
    this.#cacheable = value;
  }
  /**
   * @type {ContextInfo}
   */
  #context;
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

  #updateArray(target, propertyAccess, receiver) {
    this.#addNotify(target, propertyAccess, receiver);
  }

  /**
   * 
   * @param {any} target 
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
//      } else if (propName.name === CLOSE_DIALOG_METHOD) {
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
   * 
   * @param {any} target 
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

  #addProcess(target, thisArg, argumentArray) {
    this.#component.updateSlot.addProcess(new ProcessData(target, thisArg, argumentArray));
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  #addNotify(target, propertyAccess, receiver) {
    this.#component.updateSlot.addNotify(propertyAccess);
  }

  /**
   * 
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

  #closeDialog(target, data, receiver) {
    const component = this.#component;
    Object.entries(data).forEach(([key, value]) => {
      component.props[key] = value;
    });
    component.parentNode.removeChild(component);
  }

  /**
   * 
   * @param {any} target 
   * @param {{prop:string,indexes:number[]}} 
   * @param {Proxy<>} receiver 
   * @returns {any}
   */
  [Symbols.directlyGet](target, {prop, indexes}, receiver) {
    let value =  super[Symbols.directlyGet](target, {prop, indexes}, receiver);
    if (value instanceof Array) {
      const propName = PropertyName.create(prop);
      value = create(value, () => {
        this.#updateArray(target, { propName, indexes }, receiver);
      });
    }
    return value;
  }

  /**
   * 
   * @param {any} target 
   * @param {Proxy<>} receiver 
   * @returns {boolean}
   */
  [Symbols.beCacheable](target, receiver) {
    this.cacheable = true;
    this.#cache.clear();
    return this.cacheable;
  }

  /**
   * 
   * @param {any} target 
   * @param {Proxy<>} receiver 
   * @returns {boolean}
   */
  [Symbols.beUncacheable](target, receiver) {
    this.cacheable = false;
    return this.cacheable;
  }
  /**
   * 
   * @param {any} target 
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

  wrapArray(target, {prop, value}, receiver) {
    if (value instanceof Array) {
      const lastIndexes = this.lastIndexes;
      value = create(value, () => {
        let { propName, indexes } = PropertyName.parse(prop);
        if (!propName.isPrimitive) {
          if (propName.level > indexes.length) {
            indexes = lastIndexes.slice(0, propName.level);
          }
        }
        this.#updateArray(target, { propName, indexes }, receiver);
      });
    }
    return value;
  }

  /**
   * 
   * @param {any} target 
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
          if (typeof this.context !== "undefined" && propName.level > 0) {
            const param = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
            if (typeof param === "undefined") utils.raise(`${prop} is outside loop`);
            value = this[Symbols.directlyGet](target, { prop, indexes:param.indexes}, receiver);
            break;
          }
        }
        value = super.get(target, prop, receiver);
      } while(false);
      return this.wrapArray(target, { prop, value }, receiver);
    }
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   * @returns {boolean}
   */
  set(target, prop, value, receiver) {
    value = (value?.[Symbols.isProxy]) ? value[Symbols.getRaw] : value;
    let result;
    do {
      if (typeof prop === "string" && !prop.startsWith("@@__") && prop !== "constructor") {
        const propName = PropertyName.create(prop);
        if (typeof this.context !== "undefined" && propName.level > 0) {
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
   * 
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
   * updateされたviewModelのプロパティにバインドされているnodeのプロパティを更新する
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
        }
        toTemplateBind(bind)?.templateChildren.forEach(templateChild => updateNode(templateChild.binds));
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
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {Map<string,{bindProp:string,bindIndexes:number[]}>}
   */
  #bindPropByThisProp = new Map();

  /**
   * @type {Proxy<typeof ViewModel>}
   */
  #data = new Proxy({}, new Handler$3);

  get hasParent() {
    return this.#component?.parentComponent?.viewModel != null;
  }
  /**
   * @type {{key:string,value:any}|ViewModel}
   */
  get data() {
    const data = this.hasParent ? this.#component.parentComponent.viewModel : this.#data;
//    (data[Symbols.isSupportDotNotation]) || utils.raise(`data is not support dot-notation`);
    return data;
  }
  /**
   * 
   */
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
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * 
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
   * 
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
 * @type {Component} component
 * @returns {Proxy<Handler>}
 */
function createProps(component) {
  return new Proxy({}, new Handler$1(component));
}

class GlobalDataHandler extends Handler$3 {
  /**
   * @type {Map<string,Set<Component>>}
   */
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
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {Set<string>}
   */
  setOfProps = new Set;

  /**
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * 
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

class Module {
  /**
   * @type {string}
   */
  html;
  /**
   * @type {string}
   */
  css;
  /**
   * @type {class<ViewModel>}
   */
  ViewModel;
  /**
   * @type {class<HTMLElement>}
   */
  extendClass;
  /**
   * @type {string}
   */
  extendTag;

  /**
   * @type {HTMLTemplateElement}
   */
  #template;
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
          newTemplate.dataset.bind = template.dataset.bind;
          template = newTemplate;
        }
        template.dataset.uuid = uuid;
        replaceTemplate(template.content);
        Templates.templateByUUID.set(uuid, template);
      }
    };
    replaceTemplate(root.content);

    return root.innerHTML;
  }

  /**
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
   * @typedef {class<HTMLElement>} ComponentClass
   */
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
   * @param {Object<string,UserComponentModule} components 
   * @returns {Main}
   */
  static componentModules(components) {
    Object.entries(components).forEach(([name, componentModule]) => {
      const componentName = utils.toKebabCase(name);
      const componentClass = ComponentClassGenerator.generate(componentModule);
      if (componentModule.extendClass && componentModule.extendTag) {
        customElements.define(componentName, componentClass, { extends:componentModule.extendTag });
      } else if (typeof componentModule?.extendClass === "undefined" && typeof componentModule?.extendTag === "undefined") {
        customElements.define(componentName, componentClass);
      } else {
        utils.raise("extendClass and extendTag should be both set, or unset");
      }
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
  /**
   * @type {(value:any)=>{}}
   */
  #resolve;
  /**
   * @type {()=>{}}
   */
  #reject;
  /**
   * @type {boolean}
   */
  #alive = true;
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
   * 
   */
  stop() {
    this.#reject(new ThreadStop("stop"));
  }

  /**
   * 
   * @param {UpdateSlot} slot 
   */
  wakeup(slot) {
    this.#resolve(slot);
  }

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
  /**
   * @type {PropertyAccess[]}
   */
  queue = [];

  /**
   * @type {UpdateSlotStatusCallback}
   */
  #statusCallback;

  /**
   * @type {Component}
   */
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
   * 
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

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */
class UpdateSlot {
  /**
   * @type {ViewModelUpdator}
   */
  #viewModelUpdator;
  get viewModelUpdator() {
    return this.#viewModelUpdator;
  }
  /**
   * @type {NotifyReceiver}
   */
  #notifyReceiver;
  get notifyReceiver() {
    return this.#notifyReceiver;
  }
  /**
   * @type {NodeUpdator}
   */
  #nodeUpdator;
  get nodeUpdator() {
    return this.#nodeUpdator;
  }
  /**
   * @type {()=>{}}
   */
  #callback;
  /**
   * @type {Promise<void>}
   */
  #waitPromise;
  /**
   * @type {Promise<void>}
   */
  #alivePromise;

  /**
   * @type {(value) => {}}
   */
  #waitResolve;
  /**
   * @type {() => {}}
   */
  #waitReject;
  /**
   * @type {(value) => {}}
   */
  #aliveResolve;
  /**
   * @type {() => {}}
   */
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
   * 
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {Component} component
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns 
   */
  static create(component, callback, statusCallback) {
    return new UpdateSlot(component, callback, statusCallback);
  }

}

class AttachableShadow {
  static setOfTags = new Set([
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
   * 
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isCustomTag(tagName) {
    return tagName.indexOf("-") !== -1;
  }

  static isAttachableShadow(tagName) {
    return this.isCustomTag(tagName) || this.setOfTags.has(tagName);
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
  /**
   * @type {ViewModelProxy}
   */
  get viewModel() {
    return this._viewModel;
  },
  set viewModel(value) {
    this._viewModel = value;
  },
  /**
   * バインドリスト
   * @type {BindInfo[]}
   */
  get binds() {
    return this._binds;
  },
  set binds(value) {
    this._binds = value;
  },

  /**
   * 更新スレッド
   * @type {Thread}
   */
  get thread() {
    return this._thread;
  },
  set thread(value) {
    this._thread = value;
  },

  /**
   * 更新処理用スロット
   * @type {UpdateSlot}
   */
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
  /**
   * 単体テストのモック用
   */
  set updateSlot(value) {
    this._updateSlot = value;
  },
  /**
   * @type {Object<string,any>}
   */
  get props() {
    return this._props;
  },
  /**
   * @type {Object<string,any>}
   */
  get globals() {
    return this._globals;
  },

  /**
   * @type {(...args) => {}}
   */
  get initialResolve() {
    return this._initialResolve;
  },
  set initialResolve(value) {
    this._initialResolve = value;
  },
  /**
   * @type {() => {}}
   */
  get initialReject() {
    return this._initialReject;
  },
  set initialReject(value) {
    this._initialReject = value;
  },
  /**
   * 初期化確認用プロミス
   * @type {Promise}
   */
  get initialPromise() {
    return this._initialPromise;
  },
  set initialPromise(value) {
    this._initialPromise = value;
  },

  /**
   * @type {(...args) => {}}
   */
  get aliveResolve() {
    return this._aliveResolve;
  },
  set aliveResolve(value) {
    this._aliveResolve = value;
  },
  /**
   * @type {() => {}}
   */
  get aliveReject() {
    return this._aliveReject;
  },
  set aliveReject(value) {
    this._aliveReject = value;
  },
  /**
   * 生存確認用プロミス
   * @type {Promise}
   */
  get alivePromise() {
    return this._alivePromise;
  },
  set alivePromise(value) {
    this._alivePromise = value;
  },

  /**
   * 親コンポーネント
   * @type {Component}
   */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  },

  /**
   * shadowRootを使ってカプセル化をする(true)
   * @type {boolean}
   */
  get withShadowRoot() {
    return this.hasAttribute("with-shadow-root");
  },

  /**
   * viewのルートとなる要素
   * @type {ShadowRoot|HTMLElement}
   */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  },

  /**
   * 
   */
  initialize() {
    this._viewModel = undefined;
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

    this.initialPromise = new Promise((resolve, reject) => {
      this.initialResolve = resolve;
      this.initialReject = reject;
    });
  },

  /**
   * @type {string[]}
   */
//  static get observedAttributes() {
//    return [/* 変更を監視する属性名の配列 */];
//  }

  async build() {
    const { template, ViewModel } = this.constructor; // staticから取得
    if (AttachableShadow.isAttachableShadow(this.tagName.toLowerCase()) && this.withShadowRoot) {
      this.attachShadow({mode: 'open'});
    }
    this.thread = new Thread;

    this.viewModel = createViewModel(this, ViewModel);
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
   * DOMツリーへ追加
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
   * DOMツリーから削除
   */
  disconnectedCallback() {
    this.aliveResolve && this.aliveResolve(this.props[Symbols.toObject]());
  },

  /**
   * 移動時
   */
/*
  adoptedCallback() {
    
  }
*/

  /**
   * 属性値更新
   * @param {string} name 
   * @param {any} oldValue 
   * @param {any} newValue 
   */
/*
  attributeChangedCallback(name, oldValue, newValue) {
    
  }
*/

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
        /**
         * @type {HTMLTemplateElement}
         * @static
         */
        static template = module.template;
        /**
         * @type {class<typeof ViewModel>}
         * @static
         */
        static ViewModel = module.ViewModel;
        /**
         * @type {boolean}
         */
        get [Symbols.isComponent] () {
          return true;
        }
        /**
         * 
         */
        constructor() {
          super();
          this.initialize();
        }
        /**
         * 
         */
        initialize() {
        }
      };
    };
  
    const module = Object.assign(new Module, componentModule);
    // 同じクラスを登録できないため新しいクラスを生成する
    const componentClass = getBaseClass(module);
    if (typeof module.extendClass === "undefined") ; else {
      // カスタマイズされた組み込み要素
      // extendsを書き換える
      // See http://var.blog.jp/archives/75174484.html
      componentClass.prototype.__proto__ = module.extendClass.prototype;
      componentClass.__proto__ = module.extendClass;
    }
  
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
  static regist(name, module) {
    if (name.startsWith("filter-")) {
      const filterName = name.slice("filter-".length);
      const { output, input } = module;
      Filter.regist(filterName, output, input);
    } else {
      const tagName = name;
      if (module instanceof HTMLElement) {
        window.customElements.define(tagName, module);
      } else {
        window.customElements.define(tagName, ComponentClassGenerator.generate(module));
      }
    }
  }
}

const loader = Loader.create(QuelModuleRegistrar);

export { Main as default, generateComponentClass, loader };
