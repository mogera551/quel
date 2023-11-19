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
const Symbols$2 = {
  directlyGet: SYM_DIRECT_GET,
  directlySet: SYM_DIRECT_SET,
  isSupportDotNotation: SYM_IS_SUPPORT_DOT_NOTATION,
};

const RE_CONTEXT_INDEX = new RegExp(/^\$([0-9]+)$/);

class PropertyName {
  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {string[]} */
  #pathNames;
  /** @type {string[]} 名前（name）をドットで区切った配列 */
  get pathNames() {
    return this.#pathNames;
  }

  /** @type {string[] */
  #parentPathNames;
  /** @type {string[]} 名前（name）をドットで区切った配列、最後の要素を含まない */
  get parentPathNames() {
    return this.#parentPathNames;
  }

  /** @type {string} */
  #parentPath;
  /** @type {string} 親の名前、親名前配列（parentPathNames）をjoinしたもの */
  get parentPath() {
    return this.#parentPath;
  }

  /** @type {string[]} */
  #parentPaths;
  /** @type {string[]} 親の名前候補すべて */
  get parentPaths() {
    return this.#parentPaths;
  }

  /** @type {Set<string>} */
  #setOfParentPaths;
  /** @type {Set<string>} 親の名前候補のセット */
  get setOfParentPaths() {
    return this.#setOfParentPaths;
  }

  /** @type {string} */
  #lastPathName;
  /** @type {string} 名前（name）をドットで区切った配列の最後の要素 */
  get lastPathName() {
    return this.#lastPathName;
  }

  /** @type {RegExp} */
  #regexp;
  /** @type {RegExp} ドット記法の書式が一致するかテストするための正規表現 */
  get regexp() {
    return this.#regexp;
  }

  /** @type {number} */
  #level;
  /** @type {number} ループレベル、名前（name）に含むワイルドカード（*）の数 */
  get level() {
    return this.#level;
  }

  /** @type {boolean} */
  #isPrimitive;
  /** @type {boolean} プリミティブかどうか、名前（name）にドット（.）を含まない */
  get isPrimitive() {
    return this.#isPrimitive;
  }

  /** @type {string} */
  #nearestWildcardName;
  /** @type {string}  最後のワイルドカードまでの部分 */
  get nearestWildcardName() {
    return this.#nearestWildcardName;
  }

  /** @type {string} */
  #nearestWildcardParentName;
  /** @type {string}  最後のワイルドカードまでの部分の親 */
  get nearestWildcardParentName() {
    return this.#nearestWildcardParentName;
  }

  /**
   * 
   * @param {string} name プロパティ名
   */
  constructor(name) {
    this.#name = name;
    this.#pathNames = name.split(DELIMITER);
    this.#parentPathNames = this.#pathNames.slice(0, -1);
    this.#parentPaths = this.#parentPathNames.reduce((paths, pathName) => { 
      paths.push(paths.at(-1)?.concat(pathName) ?? [pathName]);
      return paths;
    }, []).map(paths => paths.join("."));
    this.#setOfParentPaths = new Set(this.#parentPaths);
    this.#parentPath = this.#parentPathNames.join(DELIMITER);
    this.#lastPathName = this.#pathNames.at(-1);
    this.#regexp = new RegExp("^" + name.replaceAll(".", "\\.").replaceAll("*", "([0-9a-zA-Z_]*)") + "$");
    this.#level = this.#pathNames.reduce((level, pathName) => level += (pathName === WILDCARD ? 1 : 0), 0);
    this.#isPrimitive = (this.#pathNames.length === 1);
    this.#nearestWildcardName = undefined;
    this.#nearestWildcardParentName = undefined;
    if (this.#level > 0) {
      for(let i = this.#pathNames.length - 1; i >= 0; i--) {
        if (this.#pathNames[i] === WILDCARD) {
          this.#nearestWildcardName = this.#pathNames.slice(0, i + 1).join(".");
          this.#nearestWildcardParentName = this.#pathNames.slice(0, i).join(".");
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
    if (typeof propertyName !== "undefined") return propertyName;
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
  directlyGet(target, {prop, indexes}, receiver) {
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
  directlySet(target, {prop, indexes, value}, receiver) {
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
    if (prop === Symbols$2.directlyGet) {
      // プロパティとindexesを直接指定してgetする
      return (prop, indexes) => 
        Reflect.apply(this.directlyGet, this, [target, { prop, indexes }, receiver]);
    } else if (prop === Symbols$2.directlySet) {
      // プロパティとindexesを直接指定してsetする
      return (prop, indexes, value) => 
        Reflect.apply(this.directlySet, this, [target, { prop, indexes, value }, receiver]);
    } else if (prop === Symbols$2.isSupportDotNotation) {
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
        return getFunc(propAccess);
      } else {
        return getFunc({
          propName:propAccess.propName,
          indexes:propAccess.indexes.concat(lastIndexes?.slice(propAccess.indexes.length) ?? [])
        });
      }
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
        return setFunc(propAccess, value);
        } else {
        return setFunc({
          propName:propAccess.propName,
          indexes:propAccess.indexes.concat(lastIndexes?.slice(propAccess.indexes.length) ?? [])
        }, value);
      }
    } else {
      return Reflect.set(target, prop, value, receiver);
    }
 }
};

/**
 * @enum {Symbol}
 */
const Symbols$1 = Object.assign({
  connectedCallback: Symbol.for(`${name}:viewModel.connectedCallback`),
  disconnectedCallback: Symbol.for(`${name}:viewModel.disconnectedCallback`),
  writeCallback: Symbol.for(`${name}:viewModel.writeCallback`),
  getDependentProps: Symbol.for(`${name}:viewModel.getDependentProps`),
  clearCache: Symbol.for(`${name}:viewModel.clearCache`),
  directlyCall: Symbol.for(`${name}:viewModel.directCall`),
  notifyForDependentProps: Symbol.for(`${name}:viewModel.notifyForDependentProps`),

  boundByComponent: Symbol.for(`${name}:globalData.boundByComponent`),

  bindTo: Symbol.for(`${name}:componentModule.bindTo`),

  bindProperty: Symbol.for(`${name}:props.bindProperty`),
  toObject: Symbol.for(`${name}:props.toObject`),

  isComponent: Symbol.for(`${name}:component.isComponent`),
}, Symbols$2);

/**
 * @typedef { {prop:string,value:any} } PropsAccessor
 */

/**
 * @type {ProxyHandler<PropsAccessor>}
 */
let Handler$1 = class Handler {
  /** @type {Component} */
  #component;

  /** @type {Map<string,{name:string,indexes:number[]}>} */
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
        const { name, indexes } = bindAccess;
        retObject[key] = viewModel[Symbols$1.directlyGet](name, indexes);      }
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
    if (prop === Symbols$1.bindProperty) {
      return (thisProp, propAccess) => 
        this.#bindPropByThisProp.set(thisProp, propAccess );
    } else if (prop === Symbols$1.toObject) {
      return () => this.object;
    }
    const { data } = this;
    if (this.hasParent) {
      const { name, indexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (name) {
        return data[Symbols$1.directlyGet](name, indexes);
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
      const { name, indexes } = this.#bindPropByThisProp.get(prop) ?? {};
      if (name) {
        return data[Symbols$1.directlySet](name, indexes, value);
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
    if (prop === Symbols$1.boundByComponent) {
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
    const result = receiver[Symbols$1.directlySet](propName.name, indexes, value);
    let setOfComponent = this.#setOfComponentByProp.get(propName.name);
    if (setOfComponent) {
      for(const component of setOfComponent) {
        component.viewModel[Symbols$1.notifyForDependentProps]("$globals." + propName.name, indexes);
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
    GlobalData.data[Symbols$1.boundByComponent](this.#component, prop);
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
    return GlobalData.data[Symbols$1.directlyGet](name, indexes);
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
    return GlobalData.data[Symbols$1.directlySet](name, indexes, value);
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols$1.directlyGet) {
      return this.directGet;
    } else if (prop === Symbols$1.directlySet) {
      return this.directSet;
    } else if (prop === Symbols$1.isSupportDotNotation) {
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

let utils$1 = class utils {
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
};

class Templates {
  /** @type {Map<string,HTMLTemplateElement>} */
  static templateByUUID = new Map;

}

const DATASET_BIND_PROPERTY$3 = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

class Module {
  /** @type {string} */
  html;

  /** @type {string} */
  css;

  /** @type {ViewModel.constructor} */
  ViewModel;

  /** @type {HTMLElement.constructor} */
  extendClass;

  /** @type {string} */
  extendTag;

  /** @type {boolean} */
  usePseudo = false;

  /** @type {boolean} */
  useShadowRoot = false;

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
   * <template>を<!--@@|...-->へ置換
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
    /** @type {(element:HTMLElement)=>{}} */
    const replaceTemplate = (element) => {
      /** @type {HTMLTemplateElement} */
      let template;
      while(template = element.querySelector("template")) {
        const uuid =  utils$1.createUUID();
        const comment = document.createComment(`@@|${uuid}`);
        template.parentNode.replaceChild(comment, template);
        if (template.constructor !== HTMLTemplateElement) {
          // SVGタグ内のtemplateタグを想定
          const newTemplate = document.createElement("template");
          for(let childNode of Array.from(template.childNodes)) {
            newTemplate.content.appendChild(childNode);
          }
          newTemplate.setAttribute(DATASET_BIND_PROPERTY$3, template.getAttribute(DATASET_BIND_PROPERTY$3));
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
    if (name in outputFilters) utils$1.raise(`regist filter error duplicate name (${name})`);
    if (name in inputFilters) utils$1.raise(`regist filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
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
      const componentName = utils$1.toKebabCase(name);
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
    const customElementKebabName = utils$1.toKebabCase(customElementName);
    const componentClass = ComponentClassGenerator.generate(componentModule);
    if (componentModule.extendTag) {
      customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
    } else if (typeof componentModule?.extendClass === "undefined") {
      customElements.define(customElementKebabName, componentClass);
    } else {
      utils$1.raise("extendTag should be set");
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

class NodeUpdator {
  /** @type {Map<import("../binding/Binding.js").Binding,any>} */
  queue = new Map;

  /**
   * 更新する順番を並び替える
   * ※optionを更新する前に、selectを更新すると、値が設定されない
   * 1.HTMLSelectElementかつvalueプロパティ、でないもの
   * 2.HTMLSelectElementかつvalueプロパティ
   * @param {import("../binding/Binding.js").Binding[]} bindings 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  reorder(bindings) {
    bindings.sort((binding1, binding2) => {
      if (binding1.isSelectValue && binding2.isSelectValue) return 0;
      if (binding1.isSelectValue) return 1;
      if (binding2.isSelectValue) return -1;
      return 0;
    });
    return bindings;
  }

  /**
   * @returns {void}
   */
  async exec() {
    while(this.queue.size > 0) {
      const bindings = this.reorder(Array.from(this.queue.keys()));
      for(const binding of bindings) {
        binding.nodeProperty.assignValue(this.queue.get(binding));
      }
      this.queue = new Map;
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.size === 0;
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

  /**
   * 
   */
  async exec() {
    while(this.queue.length > 0) {
      const processes = this.queue.splice(0);
      for(const process of processes) {
        await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
      }
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

class ViewModelHandlerBase extends Handler$2 {
  /** @type {Component} */
  #component;
  get component() {
    return this.#component;
  }

  /** @type {import("./DependentProps.js").DependentProps} */
  #dependentProps;
  get dependentProps() {
    return this.#dependentProps;
  }

  /** @type {Set<string>} */
  #setOfAccessorProperties;
  get setOfAccessorProperties() {
    return this.#setOfAccessorProperties;
  }

  /**
   * 
   * @param {Component} component 
   * @param {Set<string>} setOfAccessorProperties
   * @param {import("./DependentProps.js").DependentProps} dependentProps
   */
  constructor(component, setOfAccessorProperties, dependentProps) {
    super();
    this.#component = component;
    this.#setOfAccessorProperties = setOfAccessorProperties;
    this.#dependentProps = dependentProps;
  }

  /**
   * 更新処理をキューイングする
   * @param {ViewModel} target 
   * @param {Proxy} thisArg 
   * @param {any[]} argumentArray 
   */
  addProcess(target, thisArg, argumentArray) {
    this.#component.updateSlot?.addProcess(new ProcessData(target, thisArg, argumentArray));
  }

  /**
   * 更新情報をキューイングする
   * @param {ViewModel} target 
   * @param {PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  addNotify(target, propertyAccess, receiver) {
    this.#component.updateSlot?.addNotify(propertyAccess);
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
    const dependentProps = viewModel[Symbols$1.getDependentProps]();
    const setOfProps = dependentProps.setOfPropsByRefProp.get(propName.name);
    const propertyAccesses = [];
    if (typeof setOfProps === "undefined") return [];
    for(const prop of setOfProps) {
      const curPropName = PropertyName.create(prop);
      if (indexes.length < curPropName.level) {
        if (curPropName.setOfParentPaths.has(propName.name)) continue;
        const listOfIndexes = ViewModelHandlerBase.expandIndexes(viewModel, { propName:curPropName, indexes });
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
            retIndexes = (viewModel[Symbols$1.directlyGet](parentName, loopIndexes)).flatMap((value, index) => {
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
              retIndexes = (viewModel[Symbols$1.directlyGet](parentName, loopIndexes)).flatMap((value, index) => {
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

class NotifyReceiver {
  /** @type {PropertyAccess[]} */
  queue = [];

  /** @type {Component} */
  #component;

  /**
   * @param {Component} component
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * @returns {void}
   */
  async exec() {
    while(this.queue.length > 0) {
      const notifies = this.queue.splice(0);
      const dependentPropertyAccesses = [];
      for(const propertyAccess of notifies) {
        dependentPropertyAccesses.push(...ViewModelHandlerBase.makeNotifyForDependentProps(this.#component.viewModel, propertyAccess));
      }
      const setOfUpdatedViewModelPropertyKeys = new Set(
        notifies.concat(dependentPropertyAccesses).map(propertyAccess => propertyAccess.propName.name + "\t" + propertyAccess.indexes.toString())
      );
      this.#component.updateNode(setOfUpdatedViewModelPropertyKeys);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * @enum {number} 実行フェーズ
 */
const Phase = {
  sleep: 0 ,
  updateViewModel: 1,
  gatherUpdatedProperties: 2,
  applyToNode: 3,
  terminate: 100,
};

/**
 * @typedef {(phase:import("./Phase.js").Phase, prevPhase:import("./Phase.js").Phase)=>{}} ChangePhaseCallback
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

  /** @type {ChangePhaseCallback} */
  #changePhaseCallback;

  /** @type {Phase} */
  #phase = Phase.sleep;
  get phase() {
    return this.#phase;
  }
  set phase(value) {
    const oldValue = this.#phase;
    this.#phase = value;
    if (typeof this.#changePhaseCallback !== "undefined") {
      this.#changePhaseCallback(value, oldValue);
    }
  }
  
  /**
   * 
   * @param {Component} component
   * @param {()=>{}?} callback
   * @param {ChangePhaseCallback?} changePhaseCallback
   */
  constructor(component, callback = null, changePhaseCallback = null) {
    this.#viewModelUpdator = new ViewModelUpdator();
    this.#notifyReceiver = new NotifyReceiver(component);
    this.#nodeUpdator = new NodeUpdator();
    this.#callback = callback;
    this.#changePhaseCallback = changePhaseCallback;
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

  /** @type {boolean} */
  get isEmpty() {
    return this.#viewModelUpdator.isEmpty && this.#notifyReceiver.isEmpty && this.#nodeUpdator.isEmpty;
  }

  async exec() {
    do {
      this.phase = Phase.updateViewModel;
      await this.#viewModelUpdator.exec();

      this.phase = Phase.gatherUpdatedProperties;
      await this.#notifyReceiver.exec();

      this.phase = Phase.applyToNode;
      await this.#nodeUpdator.exec();
    } while(!this.#viewModelUpdator.isEmpty || !this.#notifyReceiver.isEmpty || !this.#nodeUpdator.isEmpty);

    this.phase = Phase.terminate;
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
   * @param {import("../binding/Binding.js").Binding} binding 
   * @param {any} value
   */
  async addNodeUpdate(binding, value) {
    this.#nodeUpdator.queue.set(binding, value);
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
   * @param {ChangePhaseCallback} changePhaseCallback 
   * @returns {UpdateSlot}
   */
  static create(component, callback, changePhaseCallback) {
    return new UpdateSlot(component, callback, changePhaseCallback);
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
   * タグ名がカスタム要素かどうか
   * →ダッシュ(-)を含むかどうか
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

class NodeProperty {
  /** @type {Node} */
  #node;
  get node() {
    return this.#node;
  }

  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {string[]} */
  #nameElements = [];
  get nameElements() {
    return this.#nameElements;
  }

  /** @type {any} */
  get value() {
    return this.node[this.name];
  }
  set value(value) {
    this.node[this.name] = value;
  }

  /** @type {Filter[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {Object<string,FilterFunc>} */
  #filterFuncs;
  get filterFuncs() {
    return this.#filterFuncs;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForInput(this.value, this.filters, this.filterFuncs) : this.value;
  }

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return true;
  }

  /** @type {import("../Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  /** @type {boolean} */
  get expandable() {
    return false;
  }

  /** @type {boolean} */
  get isSelectValue() {
    return false;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Node} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof Node)) utils$1.raise("not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  /**
   * 更新前処理
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  beforeUpdate(setOfUpdatedViewModelPropertyKeys) {
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return this.value === value;
  }

  assignFromViewModelValue() {
    this.value = this.binding.viewModelProperty.filteredValue ?? "";
  }

  assignValue(value) {
    this.value = value;
  }
}

class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement | undefined} */
  get template() {
    return Templates.templateByUUID.get(this.uuid);
  }

  /** @type {string} */
  get uuid() {
    return TemplateProperty.getUUID(this.node);
  }

  /**
   * 
   * @param {Node} node 
   * @returns {string}
   */
  static getUUID(node) {
    return node.textContent.slice(3)
  }
  
  /** @type {Boolean} */
  get expandable() {
    return true;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof Comment)) utils$1.raise("not Comment");
    const uuid = TemplateProperty.getUUID(node);
    if (typeof uuid === "undefined") utils$1.raise(`invalid uuid ${uuid}`);
    super(binding, node, name, filters, filterFuncs);
  }
}

/**
 * 
 * @param {BindingManager} bindingManager 
 * @returns 
 */
const applyToNodeFunc = bindingManager => bindingManager.applyToNode();

class Repeat extends TemplateProperty {
  /** @type {number} */
  get value() {
    return this.binding.children.length;
  }
  set value(value) {
    if (!Array.isArray(value)) utils$1.raise("value is not array");
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const newContext = this.binding.viewModelProperty.createChildContext(newIndex);
        const bindingManager = BindingManager.create(this.binding.component, this.template, newContext);
        this.binding.appendChild(bindingManager);
      }
    } else if (this.value > value.length) {
      const removeBindingManagers = this.binding.children.splice(value.length);
      this.binding.children.forEach(applyToNodeFunc);
      removeBindingManagers.forEach(bindingManager => bindingManager.removeFromParent());
    } else {
      this.binding.children.forEach(applyToNodeFunc);
    }
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (name !== "loop") utils$1.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}

class Branch extends TemplateProperty {
  /** @type {boolean} */
  get isSelectValue() {
    return false;
  }

  /** @type {boolean} */
  get value() {
    return this.binding.children.length > 0;
  }
  set value(value) {
    if (typeof value !== "boolean") utils$1.raise("value is not boolean");
    if (this.value !== value) {
      if (value) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding.context);
        this.binding.appendChild(bindingManager);
      } else {
        const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
        removeBindingManagers.forEach(bindingManager => bindingManager.removeFromParent());
      }
    } else {
      this.binding.children.forEach(bindings => bindings.applyToNode());
    }
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (name !== "if") utils$1.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}

class MultiValue {
  /** @type {any} */
  #value;
  get value() {
    return this.#value;
  }

  /** @type {boolean} */
  #enabled;
  get enabled() {
    return this.#enabled;
  }

  /**
   * 
   * @param {any} value 
   * @param {boolean} enabled 
   */
  constructor(value, enabled) {
    this.#value = value;
    this.#enabled = enabled;
  }
}

/**
 * @type {ContextParam}
 */
class ContextParam {
  /** @type {PropertyName} */
  #propName;
  get propName() {
    return this.#propName;
  }

  /** @type {number[]} */
  #indexes = [];
  get indexes() {
    return this.#indexes;
  }

  /** @type {number} */
  #pos;
  get pos() {
    return this.#pos;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {number} pos 
   */
  constructor(propName, indexes, pos) {
    this.#propName = propName;
    this.#indexes = indexes;
    this.#pos = pos;
  }
}
/**
 * @typedef {Object} ContextParam
 * @property {PropertyName} propName
 * @property {number[]} indexes
 * @property {number} pos
 */

/**
 * @type {ContextInfo}
 */
class ContextInfo {
  /** @type {number[]} */
  #indexes = [];
  get indexes() {
    return this.#indexes;
  }

  /** @type {number[]} */
  #stack = [];
  get stack() {
    return this.#stack;
  }

  /**
   * 
   * @param {ContextInfo} src 
   */
  copy(src) {
    this.#indexes = src.indexes.slice();
    this.#stack = src.stack.slice();
  }

}

class Context {

  /**
   * 空のコンテクスト情報を生成
   * @returns {ContextInfo}
   */
  static create() {
    return new ContextInfo;
  }

  /**
   * コンテクスト情報をクローン
   * @param {ContextInfo} src 
   * @returns {ContextInfo}
   */
  static clone(src) {
    const contextInfo = new ContextInfo;
    contextInfo.copy(src);
    return contextInfo;
  }
}

class ViewModelProperty {
  /** @type { ViewModel } */
  get viewModel() {
    return this.#binding.component.viewModel;
  }

  /** @type { string } */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {PropertyName} */
  get propertyName() {
    return PropertyName.create(this.name);
  }

  /** @type {number[]} */
  get indexes() {
    return this.binding.contextParam?.indexes ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  #key;
  get key() {
    return this.name + "\t" + this.indexesString;
  }

  /** @type {any} */
  get value() {
    return this.viewModel[Symbols$1.directlyGet](this.name, this.indexes);
  }
  set value(value) {
    const setValue = value => {
      this.viewModel[Symbols$1.directlySet](this.name, this.indexes, value);
    };
    if (value instanceof MultiValue) {
      const thisValue = this.value;
      if (Array.isArray(thisValue)) {
        const setOfThisValue = new Set(thisValue);
        value.enabled ? setOfThisValue.add(value.value) : setOfThisValue.delete(value.value);
        setValue(Array.from(setOfThisValue));
      } else {
        if (value.enabled) {
          setValue(value.value);
        }
      }
    } else {
      setValue(value);
    }
  }

  /** @type {Filter[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {Object<string,FilterFunc>} */
  #filterFuncs;
  get filterFuncs() {
    return this.#filterFuncs;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForOutput(this.value, this.filters, this.filterFuncs) : this.value;
  }

  /** @type {boolean} applyToViewModel()の対象かどうか */
  get applicable() {
    return true;
  }

  /** @type {import("../Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, name, filters, filterFuncs) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * 
   * @param {number} newIndex
   * @returns {ContextInfo} 
   */
  createChildContext(newIndex) {
    const pos = this.binding.context.indexes.length;
    const propName = this.propertyName;
    const parentIndexes = this.binding.contextParam?.indexes ?? [];

    const newContext = Context.clone(this.binding.context);
    newContext.indexes.push(newIndex);
    newContext.stack.push(new ContextParam(propName, parentIndexes.concat(newIndex), pos));

    return newContext;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  /**
   * このバインドが更新対象かどうか
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  isUpdate(setOfUpdatedViewModelPropertyKeys) {
    return setOfUpdatedViewModelPropertyKeys.has(this.key) && 
      !this.binding.component.updateSlot.nodeUpdator.queue.has(this);
  }

  assignFromNodeValue() {
    this.value = this.binding.nodeProperty.filteredValue;
  }

  assignValue(value) {
    this.value = value;
  }
}

const regexp$1 = RegExp(/^\$[0-9]+$/);

class ContextIndex extends ViewModelProperty {
  /** @type {number} */
  get index() {
    return Number(this.name.slice(1)) - 1;
  }

  /** @type {number} */
  get value() {
    return this.binding.context.indexes[this.index];
  }

  /** @type {number[]} */
  get indexes() {
    return [];
  }

  /** @type {string} */
  get indexesString() {
    return "";
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, name, filters, filterFuncs) {
    if (!regexp$1.test(name)) utils$1.raise(`invalid name ${name}`);
    super(binding, name, filters, filterFuncs);
  }
}

class ElementBase extends NodeProperty {
  /** @type {Element} */
  get element() {
    return this.node;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Element} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(binding, node, name, filters, inputFilterFuncs) {
    if (!(node instanceof Element)) utils$1.raise("not element");
    super(binding, node, name, filters, inputFilterFuncs);
  }
}

class ElementClassName extends ElementBase {
  /** @type {any} */
  get value() {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  set value(value) {
    this.element.className = value.join(" ");
  }
}

class Checkbox extends ElementBase {
  /** @type {boolean} */
  get isSelectValue() {
    return false;
  }

  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {any} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }
  set value(value) {
    /** @type {Array} */
    const array = value;
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = array.find(v => v === multiValue.value) ? true : false;
  }

  /** @type {any} */
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    return new MultiValue(
      this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters, this.filterFuncs) : multiValue.value, 
      multiValue.enabled
    );
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof HTMLInputElement)) utils$1.raise("not htmlInputElement");
    if (node.type !== "checkbox") utils$1.raise("not checkbox");
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}

class Radio extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {any} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }
  set value(value) {
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  /** @type {any} */
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    return new MultiValue(
      this.filters.length > 0 ? Filter.applyForInput(multiValue.value, this.filters, this.filterFuncs) : multiValue.value, 
      multiValue.enabled
    );
  }
  
  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof HTMLInputElement)) utils$1.raise("not htmlInputElement");
    if (node.type !== "radio") utils$1.raise("not radio");
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}

class ElementEvent extends ElementBase {
  /** @type {string} nameのonの後ろを取得する */
  get eventType() {
    return this.name.slice(2); // on～
  }

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return false;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!name.startsWith("on")) utils$1.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    const handler = event => this.eventHandler(event);
    this.element.addEventListener(this.eventType, handler);
  }

  /**
   * 
   * @param {Event} event
   */
  createProcessData(event) {
    const { viewModelProperty, context } = this.binding;
    return new ProcessData(
      viewModelProperty.viewModel[Symbols$1.directlyCall], 
      viewModelProperty.viewModel, 
      [viewModelProperty.name, context, event]
    );
  }

  /**
   * 
   * @param {Event} event
   */
  eventHandler(event) {
    event.stopPropagation();
    const processData = this.createProcessData(event);
    this.binding.component.updateSlot.addProcess(processData);
  }
}

class ElementClass extends ElementBase {
  /** @type {string} */
  get className() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.element.classList.contains(this.className);
  }
  set value(value) {
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
  }
}

class ElementAttribute extends ElementBase {
  /** @type {string} */
  get attributeName() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.element.getAttribute(this.attributeName);
  }
  set value(value) {
    this.element.setAttribute(this.attributeName, value);
  }
}

class ElementStyle extends ElementBase {
  /** @type {HTMLElement} */
  get htmlElement() {
    return this.node;
  }

  /** @type {string} */
  get styleName() {
    return this.nameElements[1];
  }

  /** @type {any} */
  get value() {
    return this.htmlElement.style[this.styleName];
  }
  set value(value) {
    this.htmlElement.style[this.styleName] = value;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   */
  constructor(binding, node, name, filters, inputFilterFuncs) {
    if (!(node instanceof HTMLElement)) utils$1.raise("not htmlElement");
    super(binding, node, name, filters, inputFilterFuncs);
  }
}

class ElementProperty extends ElementBase {
  /** @type {boolean} */
  #isSelectValue;
  get isSelectValue() {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.node.constructor === HTMLSelectElement && this.name === "value";
    }
    return this.#isSelectValue;
  }
}

class PropertyAccess {
  get name() {
    return this.#viewModelProperty.name;
  }

  get indexes() {
    return this.#viewModelProperty.indexes;
  }
  /** @type {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} */
  #viewModelProperty;
  /**
   * 
   * @param {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelProperty
   */
  constructor(viewModelProperty) {
    this.#viewModelProperty = viewModelProperty;
  }
}

class ComponentProperty extends ElementBase {
  /** @type {string} */
  get propName() {
    return this.nameElements[1];
  }

  /** @type {boolean} */
  get applicable() {
    return false;
  }

  /** @type {Component} */
  get thisComponent() {
    return this.node;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node[Symbols$1.isComponent])) utils$1.raise("not Component");
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.thisComponent.props[Symbols$1.bindProperty](this.propName, new PropertyAccess(this.binding.viewModelProperty));
    Object.defineProperty(this.thisComponent.viewModel, this.propName, {
      get: ((propName) => function () { return this.$props[propName]; })(this.propName),
      set: ((propName) => function (value) { this.$props[propName] = value; })(this.propName),
      configurable: true,
    });
  }

  /**
   * 更新前処理
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  beforeUpdate(setOfUpdatedViewModelPropertyKeys) {
    const viewModelProperty = this.binding.viewModelProperty.name;
    const propName = this.propName;
    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const [ name, indexesString ] = key.split("\t");
      if (name === viewModelProperty || PropertyName.create(name).setOfParentPaths.has(viewModelProperty)) {
        const remain = name.slice(viewModelProperty.length);
        const indexes = ((indexesString || null)?.split(",") ?? []).map(i => Number(i));
        this.thisComponent.viewModel?.[Symbols$1.writeCallback](`$props.${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols$1.writeCallback](`${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols$1.notifyForDependentProps](`$props.${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols$1.notifyForDependentProps](`${propName}${remain}`, indexes);
      }
    }
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
  
}

const regexp = RegExp(/^\$[0-9]+$/);

class Factory {
  // 面倒くさい書き方をしているのは、循環参照でエラーになるため
  // モジュール内で、const変数で書くとjestで循環参照でエラーになる

  /** @type {Object<boolean,Object<string,NodeProperty.constructor>> | undefined} */
  static #classOfNodePropertyByNameByIsComment;
  /** @type {Object<boolean,Object<string,NodeProperty.constructor>>} */
  static get classOfNodePropertyByNameByIsComment() {
    if (typeof this.#classOfNodePropertyByNameByIsComment === "undefined") {
      this.#classOfNodePropertyByNameByIsComment = {
        true: {
          "if": Branch,
          "loop": Repeat,
        },
        false: {
          "class": ElementClassName,
          "checkbox": Checkbox,
          "radio": Radio,
        }
      };
    }
    return this.#classOfNodePropertyByNameByIsComment;
  }

  /** @type {ObjectObject<string,NodeProperty.constructor> | undefined} */
  static #classOfNodePropertyByFirstName;
  /** @type {ObjectObject<string,NodeProperty.constructor>} */
  static get classOfNodePropertyByFirstName() {
    if (typeof this.#classOfNodePropertyByFirstName === "undefined") {
      this.#classOfNodePropertyByFirstName = {
        "class": ElementClass,
        "attr": ElementAttribute,
        "style": ElementStyle,
        "props": ComponentProperty,
      };
    }
    return this.#classOfNodePropertyByFirstName;
  }

  /**
   * Bindingオブジェクトを生成する
   * @param {BindingManager} bindingManager
   * @param {Node} node 
   * @param {string} nodePropertyName 
   * @param {ViewModel} viewModel 
   * @param {string} viewModelPropertyName 
   * @param {Filter[]} filters 
   * @returns {Binding}
   */
  static create(bindingManager, node, nodePropertyName, viewModel, viewModelPropertyName, filters) {
    /** @type {NodeProperty.constructor|undefined} */
    let classOfNodeProperty;
    const classOfViewModelProperty = regexp.test(viewModelPropertyName) ? ContextIndex : ViewModelProperty;

    do {
      const isComment = node instanceof Comment;
      classOfNodeProperty = this.classOfNodePropertyByNameByIsComment[isComment][nodePropertyName];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (isComment) utils$1.raise(`unknown node property ${nodePropertyName}`);
      const nameElements = nodePropertyName.split(".");
      classOfNodeProperty = this.classOfNodePropertyByFirstName[nameElements[0]];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (node instanceof Element) {
        if (nodePropertyName.startsWith("on")) {
          classOfNodeProperty = ElementEvent;
        } else {
          classOfNodeProperty = ElementProperty;
        }
      } else {
        classOfNodeProperty = NodeProperty;
      }
    } while(false);
    
    /** @type {Binding} */
    const binding = Binding.create(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty, 
      filters);
    binding.initialize();

    return binding;
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
 * @param {string|undefined} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {BindTextInfo[]}
 */
const parseBindText = (text, defaultName) => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, viewModelProperty, filters } = parseExpression(s, DEFAULT);
    viewModelProperty = viewModelProperty === SAMENAME ? nodeProperty : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    typeof nodeProperty === "undefined" && utils$1.raise("default property undefined");
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
   * @param {string｜undefined} defaultName prop:を省略時に使用する、プロパティの名前
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
   * data-bind属性のテキストからバインド情報を生成
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   * @param {Node} node 
   * @param {ViewModel} viewModel 
   * @param {string} text data-bind属性値
   * @param {string|undefined} defaultName nodeのデフォルトプロパティ名
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static parseBindText = (bindingManager, node, viewModel, text, defaultName) => {
    return Parser.parse(text, defaultName).map(info => 
      Factory.create(bindingManager, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters));
  }

}

const DATASET_BIND_PROPERTY$2 = "data-bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY$1 = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils$1.raise(`not HTMLElement`);

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
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement);


class BindToHTMLElement {
  /**
   * バインドを実行する（ノードがHTMLElementの場合）
   * デフォルトイベントハンドラの設定を行う
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {HTMLElement}  */
    const element = toHTMLElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$2);
    /** @type {string} */
    const defaultName = getDefaultProperty(element);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, defaultName);

    // イベントハンドラ設定
    /** @type {boolean} デフォルトイベントを設定したかどうか */
    let hasDefaultEvent = false;

    /** @type {import("../binding/Binding.js").Binding|null} */
    let defaultBinding = null;

    /** @type {import("../binding/Radio.js").Radio|null} */
    let radioBinding = null;

    /** @type {import("../binding/Checkbox.js").Checkbox|null} */
    let checkboxBinding = null;

    bindings.forEach(binding => {
      hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
      radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
      checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
      defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
    });

    /** @type {(binding:import("../binding/Binding.js").Binding)=>void} */
    const setDefaultEventHandler = (binding) => {
      element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);
    };
    if (radioBinding) {
      setDefaultEventHandler(radioBinding);
    } else if (checkboxBinding) {
      setDefaultEventHandler(checkboxBinding);
    } else if (defaultBinding && !hasDefaultEvent && isInputableElement(node)) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
    return bindings;
  }
}

const DATASET_BIND_PROPERTY$1 = "data-bind";

/**
 * 
 * @param {Node} node 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils$1.raise(`not SVGElement`);

class BindToSVGElement {
  /**
   * バインドを実行する（ノードがSVGElementの場合）
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {SVGElement} */
    const element = toSVGElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$1);
    /** @type {string|undefined} */
    const defaultName = undefined;

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, defaultName);

    return bindings;
  }

}

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment$1 = node => (node instanceof Comment) ? node : utils$1.raise("not Comment");

class BindToText {
  /**
   * バインドを実行する（ノードがComment（TextNodeの置換）の場合）
   * Commentノードをテキストノードに置換する
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    // コメントノードをテキストノードに差し替える
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {Comment} */
    const comment = toComment$1(node);
    /** @type {string} */
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    /** @type {Text} */
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, textNode, viewModel, bindText, DEFAULT_PROPERTY);

    return bindings;
  }

}

const DATASET_BIND_PROPERTY = "data-bind";
/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils$1.raise("not Comment");

class BindToTemplate {
  /**
   * バインドを実行する（ノードがComment（Templateの置換）の場合）
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const uuid = comment.textContent.slice(3);
    /** @type {HTMLTemplateElement} */
    const template = Templates.templateByUUID.get(uuid);
    /** @type {string} */
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, undefined);

    return bindings;
  }
}

class Binder {
  /**
   * DOMのプロパティとViewModelプロパティのバインドを行う
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node[]} nodes
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, nodes) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(bindingManager, node) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(bindingManager, node) :
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(bindingManager, node) : 
      (node instanceof SVGElement) ? BindToSVGElement.bind(bindingManager, node) :
      utils$1.raise(`unknown node type`)
    );
  }

}

class Binding {
  /** @type {number} */
  static seq = 0;

  /** @type {number} */
  #id;
  get id() {
    return this.#id;
  }

  /** @type {BindingManager} */
  #bindingManager;
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type { import("./nodeProperty/NodeProperty.js").NodeProperty } */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty
  }

  /** @type { import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty } */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }

  /** @type {Component} */
  get component() {
    return this.bindingManager.component;
  }

  /** @type {ContextInfo} */
  get context() {
    return this.bindingManager.context;
  }

  /** @type {ContextParam | undefined | null} コンテキスト変数情報 */
  #contextParam;
  /** @type {ContextParam | null} コンテキスト変数情報 */
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = PropertyName.create(this.viewModelProperty.name);
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      } else {
        this.#contextParam = null;
      }
    }
    return this.#contextParam;
  }

  /** @type { BindingManager[] } */
  #children = [];
  get children() {
    return this.#children;
  }

  /** @type {boolean} */
  get expandable() {
    return this.nodeProperty.expandable;
  }

  /** @type {boolean} */
  get isSelectValue() {
    return this.nodeProperty.isSelectValue;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  build(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    this.#id = ++Binding.seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = new classOfNodeProperty(this, node, nodePropertyName, filters, bindingManager.component.filters.in);
    this.#viewModelProperty = new classOfViewModelProperty(this, viewModelPropertyName, filters, bindingManager.component.filters.out);
  }

  /**
   * Nodeへ値を反映する
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty, expandable } = this;
    //console.log(`binding.applyToNode() ${nodeProperty.node?.tagName} ${nodeProperty.name} ${viewModelProperty.name} ${viewModelProperty.indexesString}`);
    if (!nodeProperty.applicable) return;
    const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
    if (nodeProperty.isSameValue(filteredViewModelValue)) return;
    /**
     * 展開可能（branchもしくはrepeat）な場合、変更スロットに入れずに展開する
     * 展開可能でない場合、変更スロットに変更処理を入れる
     * ※変更スロットに入れるのは、selectとoptionの値を入れる処理の順序をつけるため
     */
    expandable ? nodeProperty.assignFromViewModelValue() : component.updateSlot.addNodeUpdate(this, filteredViewModelValue);
  }

  /**
   * ViewModelへ値を反映する
   */
  applyToViewModel() {
    const { nodeProperty, viewModelProperty } = this;
    if (!viewModelProperty.applicable) return;
    viewModelProperty.assignFromNodeValue();
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefaultEventHandler(event) {
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    this.component.updateSlot.addProcess(process);
  }

  /** @type {(event:Event)=>void} */
  get defaultEventHandler() {
    return (binding => event => binding.execDefaultEventHandler(event))(this);
  }

  /**
   * 初期化
   */
  initialize() {
    this.nodeProperty.initialize();
    this.viewModelProperty.initialize();
    this.applyToNode();
  }

  /**
   * @param {BindingManager} bindingManager
   */
  appendChild(bindingManager) {
    if (!this.expandable) utils$1.raise("not expandable");
    const lastChild = this.children[this.children.length - 1];
    this.children.push(bindingManager);
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   * コンテキスト変更処理
   * #contextParamをクリアする
   */
  changeContext() {
    this.#contextParam = undefined;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} classOfNodeProperty 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} classOfViewModelProperty 
   * @param {Filter[]} filters
   */
  static create(bindingManager,
    node, nodePropertyName, classOfNodeProperty, 
    viewModelPropertyName, classOfViewModelProperty,
    filters
  ) {
    const binding = new Binding;
    binding.build(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty,
      filters
    );
    return binding;
  }
}

class BindingManager {
  /** @type { Component } */
  #component;
  get component() {
    return this.#component;
  }

  /** @type {Binding[]} */
  #bindings = [];
  get bindings() {
    return this.#bindings;
  }

  /** @type {Node[]} */
  #nodes = [];
  get nodes() {
    return this.#nodes;
  }

  get lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  /** @type {DocumentFragment} */
  #fragment;
  get fragment() {
    return this.#fragment;
  }

  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }

  /** @type {HTMLTemplateElement} */
  #template;
  get template() {
    return this.#template;
  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   */
  constructor(component, template, context) {
    this.#context = context;
    this.#component = component;
    this.#template = template;
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    this.#bindings = Binder.bind(this, nodes);
    this.#bindings.forEach(binding => component.bindingSummary.add(binding));
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * 
   * @param {Component} component 
   * @param {ConetextInfo} context 
   */
  setContext(component, context) {
    this.#component = component;
    this.#context = context;
    this.bindings.forEach(binding => binding.changeContext());
  }

  /**
   * 
   */
  applyToNode() {
    this.bindings.forEach(binding => binding.applyToNode());
  }

  /**
   * 
   */
  applyToViewModel() {
    this.bindings.forEach(binding => binding.applyToViewModel());
  }

  /**
   * 
   */
  removeFromParent() {
    this.nodes.forEach(node => this.fragment.appendChild(node));
    this.bindings.forEach(binding => {
      this.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.removeFromParent());
    });
    const recycleBindingManagers = BindingManager.bindingsByTemplate.get(this.template) ?? 
      BindingManager.bindingsByTemplate.set(this.template, []).get(this.template);
    recycleBindingManagers.push(this);
  }

  /**
   * updateされたviewModelのプロパティをバインドしているnodeのプロパティを更新する
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  updateNode(setOfUpdatedViewModelPropertyKeys) {
    // templateを先に展開する
    const { bindingSummary } = this.component;
    const expandableBindings = Array.from(bindingSummary.expandableBindings);
    expandableBindings.sort((bindingA, bindingB) => {
      const result = bindingA.viewModelProperty.propertyName.level - bindingB.viewModelProperty.propertyName.level;
      if (result !== 0) return result;
      const result2 = bindingA.viewModelProperty.propertyName.pathNames.length - bindingB.viewModelProperty.propertyName.pathNames.length;
      return result2;
    });
    for(const binding of expandableBindings) {
      if (setOfUpdatedViewModelPropertyKeys.has(binding.viewModelProperty.key)) {
        binding.applyToNode();
      }
    }
    bindingSummary.flush();

    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const bindings = bindingSummary.bindingsByKey.get(key) ?? new Set;
      for(const binding of bindings) {
        if (!binding.expandable) {
          binding.applyToNode();
        }
      }
    }
    for(const binding of bindingSummary.componentBindings) {
      binding.nodeProperty.beforeUpdate(setOfUpdatedViewModelPropertyKeys);
    }
  }

  /** @type {Map<HTMLTemplateElement,BindingManager[]>} */
  static bindingsByTemplate = new Map;

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   */
  static create(component, template, context) {
    const bindingManagers = this.bindingsByTemplate.get(template) ?? [];
    if (bindingManagers.length > 0) {
      const bindingManager = bindingManagers.pop();
      bindingManager.setContext(component, context);
      /**
       * 
       * @param {Binding[]} bindings 
       * @param {ContextInfo} context 
       */
      const setContext = (bindings, context) => {
        for(const binding of bindings) {
          binding.applyToNode();
          for(const bindingManager of binding.children) {
            setContext(bindingManager.bindings);
          }
        }
      };
      setContext(bindingManager.bindings);
      bindingManager.bindings.forEach(binding => component.bindingSummary.add(binding));
  
      return bindingManager;
    } else {
      return new BindingManager(component, template, context);
    }
  }

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

const WRITE_CALLBACK = "$writeCallback";
const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";

/**
 * @type {Object<symbol,string>}
 */
const callbackNameBySymbol = {
  [Symbols$1.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols$1.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols$1.writeCallback]: WRITE_CALLBACK,
};

/**
 * @type {Set<symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols$1.connectedCallback,
  Symbols$1.disconnectedCallback,
  Symbols$1.writeCallback,
]);

class Callback {
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {Proxy<ViewModel>} viewModelProxy 
   * @param {ViewModelHandlerBase} handler
   * @param {symbol} prop
   */
  static get(viewModel, viewModelProxy, handler, prop) {
    const callbackName = callbackNameBySymbol[prop];
    const applyCallback = (...args) => async () => Reflect.apply(viewModel[callbackName], viewModelProxy, args);
    if (prop === Symbols$1.connectedCallback) {
      return (callbackName in viewModel) ? (...args) => applyCallback(...args)() : () => {};
    } else {
      return (callbackName in viewModel) ? (...args) => handler.addProcess(applyCallback(...args), viewModelProxy, []) : () => {};
    }
  }

  /**
   * 
   * @param {symbol | string} prop 
   * @returns {boolean}
   */
  static has(prop) {
    return setOfAllCallbacks.has(prop);
  }
}

/** @typedef {import("./ViewModelHandlerBase.js").ViewModelHandlerBase} ViewModelHandlerBase */

/**
 * 外部から呼び出されるViewModelのAPI
 * @type {Set<symbol>}
 */
const setOfApiFunctions = new Set([
  Symbols$1.directlyCall,
  Symbols$1.getDependentProps,
  Symbols$1.notifyForDependentProps,
  Symbols$1.clearCache,
]);

/**
 * @type {Object<symbol,({viewModel:ViewModel,viewModelProxy:Proxy,handler:ViewModelHandlerBase})=>()>}
 */
const callFuncBySymbol = {
  [Symbols$1.directlyCall]:({viewModel, viewModelProxy, handler}) => async (prop, context, event) => 
    handler.directlyCallback(context, async () => 
      Reflect.apply(viewModel[prop], viewModelProxy, [event, ...context.indexes])
    ),
  [Symbols$1.notifyForDependentProps]:({viewModel, viewModelProxy, handler}) => (prop, indexes) => 
    handler.addNotify(viewModel, { propName:PropertyName.create(prop), indexes }, viewModelProxy),
  [Symbols$1.getDependentProps]:({handler}) => () => handler.dependentProps,
  [Symbols$1.clearCache]:({handler}) => () => handler.cache.clear(),
};

class Api {
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {Proxy<ViewModel>} viewModelProxy 
   * @param {import("./ViewModelHandlerBase.js").ViewModelHandlerBase} handler
   * @param {symbol} prop
   */
  static get(viewModel, viewModelProxy, handler, prop) {
    return callFuncBySymbol[prop]?.({viewModel, viewModelProxy, handler});
  }

  /**
   * @param {symbol | string} prop
   * @returns {boolean}
   */
  static has(prop) {
    return setOfApiFunctions.has(prop);
  }

}

class Dialog {
  /**
   * コンポーネントを動的に表示し、消滅するまで待つ
   * @param {string} dialogName 
   * @param {Object<string,any>} data 
   * @param {Object<string,any>} attributes 
   * @returns {Promise<boolean>}
   */
  static async open(dialogName, data, attributes) {
    const tagName = utils.toKebabCase(dialogName);
    const dialog = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      dialog.setAttribute(key, value);
    });
    Object.entries(data).forEach(([key, value]) => {
      dialog.props[Symbols.bindProperty](key, { name:key, indexes:[] });
      dialog.props[key] = value;
    });
    document.body.appendChild(dialog);
    return dialog.alivePromise;
  }

  /**
   * 動的に表示されたコンポーネントを閉じる
   * @param {Component} dialog 
   * @param {Object<string,any>} data 
   */
  static close(dialog, data) {
    Object.entries(data).forEach(([key, value]) => {
      dialog.props[key] = value;
    });
    dialog.parentNode.removeChild(dialog);
  }


}

const PROPS_PROPERTY = "$props";
const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY$1 = "$dependentProps";
const OPEN_DIALOG_METHOD = "$openDialog";
const CLOSE_DIALOG_METHOD = "$closeDialog";
const COMPONENT_PROPERTY = "$component";

/**
 * @type {Set<string>}
 */
const setOfProperties = new Set([
  PROPS_PROPERTY,
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY$1,
  OPEN_DIALOG_METHOD,
  CLOSE_DIALOG_METHOD,
  COMPONENT_PROPERTY,
]);

/**
 * @type {Object<string,({component:Component, viewModel:ViewModel})=>{}>}
 */
const getFuncByName = {
  [PROPS_PROPERTY]: ({component}) => component.props,
  [GLOBALS_PROPERTY]: ({component}) => component.globals,
  [DEPENDENT_PROPS_PROPERTY$1]: ({viewModel}) => viewModel[DEPENDENT_PROPS_PROPERTY$1],
  [OPEN_DIALOG_METHOD]: () => async (name, data = {}, attributes = {}) => Dialog.open(name, data, attributes),
  [COMPONENT_PROPERTY]: ({component}) => component,
  [CLOSE_DIALOG_METHOD]: ({component}) => (data = {}) => Dialog.close(component, data),
};

class SpecialProp {
  /**
   * 
   * @param {Component} component 
   * @param {ViewModel} viewModel 
   * @param {string} name 
   * @returns {any}
   */
  static get(component, viewModel, name) {
    return getFuncByName[name]?.({component, viewModel});
  }

  /**
   * 
   * @param {string} name 
   * @returns {boolean}
   */
  static has(name) {
    return setOfProperties.has(name);
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
    if (typeof valueByIndexesString === "undefined") {
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
 * キャッシュが利用可能なViewModelのProxyハンドラ
 * 書き込みはエラー
 */
class ReadOnlyViewModelHandler extends ViewModelHandlerBase {
  /** @type {Cache} */
  #cache = new Cache;
  get cache() {
    return this.#cache;
  }

  /**
   * プロパティ情報からViewModelの値を取得する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}  
   * @param {Proxy} receiver 
   */
  getByPropertyName(target, { propName }, receiver) {
    if (!propName.isPrimitive) {
      !this.dependentProps.hasDefaultProp(propName.name) && this.dependentProps.addDefaultProp(propName.name);
    }
    if (SpecialProp.has(propName.name)) {
      return SpecialProp.get(this.component, target, propName.name);
    } else {
      if (!propName.isPrimitive) {
          // プリミティブじゃない場合、キャッシュから取得する
        const indexes = propName.level > 0 ? this.lastIndexes.slice(0, propName.level) : [];
        let value = this.#cache.get(propName, indexes);
        if (typeof value === "undefined") {
          value = super.getByPropertyName(target, { propName }, receiver);
          this.#cache.set(propName, indexes, value);
        }
        return value;
      } else {
        return super.getByPropertyName(target, { propName }, receiver);
      }
    }
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,value:any}}  
   * @param {Proxy} receiver 
   */
  setByPropertyName(target, { propName, value }, receiver) {
    utils$1.raise("viewModel is read only");
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy} receiver 
   * @returns {any}
   */
  get(target, prop, receiver) {
    if (Callback.has(prop)) {
      return Callback.get(target, receiver, this, prop);
    } else if (Api.has(prop)) {
      return Api.get(target, receiver, this, prop);
    } else {
      return super.get(target, prop, receiver);
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
    utils$1.raise("viewModel is read only");
  }
}

/**
 * @typedef {Object} ViewModelInfo
 * @property {string[]} removeProps
 * @property {string[]} definedProps
 * @property {string[]} accessorProps
 * @property {string[]} methods
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
   * @param {ViewModel} target 
   * @returns {{definedProps:string[],methods:string[],accessorProps:string[],viewModel:ViewModel}}
   */
  static viewModelize(target) {
    let viewModelInfo = this.viewModelInfoByConstructor.get(target.constructor);
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
      this.viewModelInfoByConstructor.set(target.constructor, viewModelInfo);
    }
    viewModelInfo.removeProps.forEach(propertyKey => Reflect.deleteProperty(target, propertyKey));
    return {
      definedProps:viewModelInfo.definedProps, 
      methods:viewModelInfo.methods, 
      accessorProps:viewModelInfo.accessorProps,
      viewModel:target
    };
  }

  /** @type {Map<typeof ViewModel,ViewModelInfo>} */
  static viewModelInfoByConstructor = new Map;
  
}

/**
 * DirectlyCall時、context情報の復帰を行う
 */
class DirectlyCallContext {
  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }

  async callback(context, directlyCallback) {
    if (typeof this.#context !== "undefined") utils$1.raise("already set context");
    this.#context = context;
    try {
      return directlyCallback();
    } finally {
      this.#context = undefined;
    }
  }

}

/**
 * 書き込み可能なViewModelのProxyハンドラ
 * 書き込み時、＄writeCallbacを実行し、更新通知を投げる
 */
class WritableViewModelHandler extends ViewModelHandlerBase {
  /** @type {DirectlyCallContext} */
  #directlyCallContext = new DirectlyCallContext;
  get directlyCallContext() {
    return this.#directlyCallContext;
  }

  /**
   * プロパティ情報からViewModelの値を取得する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}  
   * @param {Proxy} receiver 
   */
  getByPropertyName(target, { propName }, receiver) {
    if (!propName.isPrimitive) {
      !this.dependentProps.hasDefaultProp(propName.name) && this.dependentProps.addDefaultProp(propName.name);
    }
    return (SpecialProp.has(propName.name)) ?
      SpecialProp.get(this.component, target, propName.name):
      super.getByPropertyName(target, { propName }, receiver)
    ;
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,value:any}}  
   * @param {Proxy} receiver 
   */
  setByPropertyName(target, { propName, value }, receiver) {
    if (!propName.isPrimitive) {
      !this.dependentProps.hasDefaultProp(propName.name) && this.dependentProps.addDefaultProp(propName.name);
    }
    const result = super.setByPropertyName(target, { propName, value }, receiver);
    const indexes = this.lastIndexes;
    receiver[Symbols$1.writeCallback](propName.name, indexes);
    this.addNotify(target, { propName, indexes }, receiver);

    return result;
  }

  async directlyCallback(context, directlyCallback) {
    return this.directlyCallContext.callback(context, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      this.stackIndexes.push(undefined);
      try {
        return directlyCallback();
      } finally {
        this.stackIndexes.pop();
      }
    });
  }

  /**
   * 
   * @param {string} prop 
   * @returns {ContextParam | undefined}
   */
  findParam(prop) {
    if (typeof this.directlyCallContext.context === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const propName = PropertyName.create(prop);
    if (propName.level === 0 || prop.at(0) === "@") return;
    const param = this.directlyCallContext.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
    if (typeof param === "undefined") utils$1.raise(`${prop} is outside loop`);
    return param;
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy} receiver 
   * @returns {any}
   */
  get(target, prop, receiver) {
    if (Callback.has(prop)) {
      return Callback.get(target, receiver, this, prop);
    } else if (Api.has(prop)) {
      return Api.get(target, receiver, this, prop);
    } else {
      const contextParam = this.findParam(prop);
      return (typeof contextParam !== "undefined") ?
        this.directlyGet(target, { prop, indexes:contextParam.indexes}, receiver) :
        super.get(target, prop, receiver);
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
    const contextParam = this.findParam(prop);
    return (typeof contextParam !== "undefined") ?
      this.directlySet(target, { prop, indexes:contextParam.indexes, value}, receiver) :
      super.set(target, prop, value, receiver);
  }

}

const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
/**
 * 
 * @param {Component} component 
 * @param {ViewModel.constructor} viewModelClass 
 * @returns {{readonly:Proxy,writable:Proxy}}
 */
function createViewModels(component, viewModelClass) {
  const viewModelInfo = ViewModelize.viewModelize(Reflect.construct(viewModelClass, []));
  const { viewModel, accessorProps } = viewModelInfo;
  const setOfAccessorProperties = new Set(accessorProps);
  const dependentProps = new DependentProps();
  dependentProps.setDependentProps(viewModel[DEPENDENT_PROPS_PROPERTY] ?? {});
  return {
    "readonly": new Proxy(viewModel, new ReadOnlyViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "writable": new Proxy(viewModel, new WritableViewModelHandler(component, setOfAccessorProperties, dependentProps)),
  };
}

class BindingSummary {

  /** @type {Map<string,Set<Binding>>} */
  #bindingsByKey = new Map;
  get bindingsByKey() {
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} */
  #expandableBindings = new Set;
  get expandableBindings() {
    return this.#expandableBindings;
  }

  /** @type {Set<Binding} */
  #componentBindings = new Set;
  get componentBindings() {
    return this.#componentBindings;
  }

  #deleteBindings = new Set;
  #allBindings = new Set;

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    this.#allBindings.add(binding);
    const bindings = this.#bindingsByKey.get(binding.viewModelProperty.key);
    if (typeof bindings !== "undefined") {
      bindings.add(binding);
    } else {
      this.#bindingsByKey.set(binding.viewModelProperty.key, new Set([binding]));
    }
    if (binding.nodeProperty.expandable) {
      this.#expandableBindings.add(binding);
    }
    if (binding.nodeProperty.constructor === ComponentProperty) {
      this.#componentBindings.add(binding);
    }
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    this.#deleteBindings.add(binding);
  }

  #delete(binding) {
    this.#allBindings.delete(binding);
    const bindings = this.#bindingsByKey.get(binding.viewModelProperty.key);
    if (typeof bindings !== "undefined") {
      bindings.delete(binding);
    }
    this.#expandableBindings.delete(binding);
    this.#componentBindings.delete(binding);
  }

  flush() {
    const remain = this.#allBindings.size - this.#deleteBindings.size;
    if(this.#deleteBindings.size > remain * 10) {
      const bindings = Array.from(this.#allBindings).filter(binding => !this.#deleteBindings.has(binding));
      this.rebuild(bindings);
    } else {
      for(const binding of this.#deleteBindings) {
        this.#delete(binding);
      }
    }
    this.#deleteBindings = new Set;
  }

  rebuild(bindings) {
    this.clear();
    for(const binding of bindings) {
      this.add(binding);
    }
  }

  clear() {
    this.#allBindings = new Set;
    this.#bindingsByKey = new Map;
    this.#expandableBindings = new Set;
    this.#componentBindings = new Set;
  }
}

/** @type {WeakMap<Node,Component>} */
const pseudoComponentByNode = new WeakMap;

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node[Symbols$1.isComponent]) return node;
    if (node instanceof ShadowRoot) {
      if (node.host[Symbols$1.isComponent]) return node.host;
      node = node.host;
    }
    const component = pseudoComponentByNode.get(node);
    if (typeof component !== "undefined") return component;
  } while(true);
};

/** @type {ComponentBase} */
const mixInComponent = {
  /** @type {ViewModelProxy} */
  get viewModel() {
    if (typeof this.updateSlot === "undefined" || 
      (this.updateSlot.phase !== Phase.gatherUpdatedProperties && this.updateSlot.phase !== Phase.applyToNode)) {
      return this._viewModels["writable"];
    } else {
      return this._viewModels["readonly"];
    }
  },

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  },
  set rootBinding(value) {
    this._rootBinding = value;
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
    if (typeof this._thread === "undefined") {
      return undefined;
    }
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, phase => {
        if (phase === Phase.gatherUpdatedProperties) {
          this.viewModel[Symbols$1.clearCache]();
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
  get useShadowRoot() {
    return this._useShadowRoot;
  },

  /** @type {boolean} 仮想コンポーネントを使う */
  get usePseudo() {
    return this._usePseudo;
  },

  /** @type {ShadowRoot|HTMLElement} viewのルートとなる要素 */
  get viewRootElement() {
    return this.usePseudo ? this.pseudoParentNode : (this.shadowRoot ?? this);
  },

  /** @type {Node} 親要素（usePseudo以外では使わないこと） */
  get pseudoParentNode() {
    return this.usePseudo ? this._pseudoParentNode : utils$1.raise("not usePseudo");
  },

  /** @type {Node} 代替要素（usePseudo以外では使わないこと） */
  get pseudoNode() {
    return this._pseudoNode;
  },

  /**
   * @type {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}}
   */
  get filters() {
    return this._filters;
  },

  /**
   * @type {BindingSummary}
   */
  get bindingSummary() {
    return this._bindingSummary;
  },

  /** 
   * 初期化
   * @returns {void}
   */
  initialize() {
    this._viewModels = createViewModels(this, this.constructor.ViewModel);
    this._rootBinding = undefined;
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

    this._useShadowRoot = this.constructor.useShadowRoot;
    this._usePseudo = this.constructor.usePseudo;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this._bindingSummary = new BindingSummary;

    this.initialPromise = new Promise((resolve, reject) => {
      this.initialResolve = resolve;
      this.initialReject = reject;
    });
  },

  /**
   * コンポーネント構築処理（connectedCallbackで呼ばれる）
   * @returns {void}
   */
  async build() {
//    console.log(`components[${this.tagName}].build`);
    const { template, inputFilters, outputFilters } = this.constructor; // staticから取得
    // フィルターの設定
    if (typeof inputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(inputFilters)) {
        if (name in this.filters.in) utils$1.raise(`already exists filter ${name}`);
        this.filters.in[name] = filterFunc;
      }
    }
    if (typeof outputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(outputFilters)) {
        if (name in this.filters.out) utils$1.raise(`already exists filter ${name}`);
        this.filters.out[name] = filterFunc;
      }
    }
    // シャドウルートの作成
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && !this.usePseudo) {
      this.attachShadow({mode: 'open'});
    }
    // スレッドの生成
    this.thread = new Thread;

    // ViewModelの初期化処理（viewModelの$connectedCallbackを実行）
    await this.viewModel[Symbols$1.connectedCallback]();

    // Bindingツリーの構築
    this.rootBinding = BindingManager.create(this, template, Context.create());
    this.bindingSummary.flush();

    if (this.usePseudo) {
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling);
      this.rootBinding.nodes.forEach(node => pseudoComponentByNode.set(node, this));
    } else {
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    if (this.updateSlot.isEmpty) {
      this.updateSlot.waitResolve(true);
    }
    await this.updateSlot.alive();
  },

  /**
   * DOMツリーへ追加時呼ばれる
   * @returns {void}
   */
  async connectedCallback() {
//    console.log(`components[${this.tagName}].connectedCallback`);
    try {
      // 親要素の初期化処理の終了を待つ
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }

      if (this.usePseudo) {
        const comment = document.createComment(`@@/${this.tagName}`);
        this._pseudoParentNode = this.parentNode;
        this._pseudoNode = comment;
        this.pseudoParentNode.replaceChild(comment, this);
      }
      // 生存確認用プロミスの生成
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
   * DOMツリーから削除で呼ばれる
   * @returns {void}
   */
  disconnectedCallback() {
    this.aliveResolve && this.aliveResolve(this.props[Symbols$1.toObject]());
  },

  /**
   * ノード更新処理
   * UpdateSlotのNotifyReceiverから呼び出される
   * @param {Set<string>} setOfViewModelPropertyKeys 
   */
  updateNode(setOfViewModelPropertyKeys) {
    this.rootBinding?.updateNode(setOfViewModelPropertyKeys);
  },
};

/**
 * コンポーネントクラスを生成するクラス
 * ※customElements.defineでタグに対して、ユニークなクラスを登録する必要があるため
 */
class ComponentClassGenerator {
  
  /**
   * コンポーネントクラスを生成
   * @param {UserComponentModule} componentModule 
   * @returns {Component.constructor}
   */
  static generate(componentModule) {
    /** @type {(module:Module)=>HTMLElement.constructor} */
    const getBaseClass = function (module) {
      return class extends HTMLElement {

        /** @type {HTMLTemplateElement} */
        static template = module.template;

        /** @type {ViewModel.constructor} */
        static ViewModel = module.ViewModel;

        /**@type {Object<string,FilterFunc>} */
        static inputFilters = module.inputFilters;

        /** @type {Object<string,FilterFunc>} */
        static outputFilters = module.outputFilters;

        /** @type {boolean} */
        static useShadowRoot = module.useShadowRoot;

        /** @type {boolean} */
        static usePseudo = module.usePseudo;

        /** @type {boolean} */
        get [Symbols$1.isComponent] () {
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

    // カスタムコンポーネントには同一クラスを登録できないため新しいクラスを生成する
    const componentClass = getBaseClass(module);
    if (typeof module.extendClass === "undefined" && typeof module.extendTag === "undefined") ; else {
      // カスタマイズされた組み込み要素
      // classのextendsを書き換える
      // See http://var.blog.jp/archives/75174484.html
      /** @type {HTMLElement.constructor} */
      const extendClass = module.extendClass ?? document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // 生成したコンポーネントクラスにComponentの機能を追加する（mix in） 
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }
    return componentClass;
  }
}
/**
 * コンポーネントクラスを生成する
 * @param {UserComponentModule} componentModule 
 * @returns {Component.constructor}
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
