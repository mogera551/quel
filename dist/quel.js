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
    if (prop === Symbols$1.directlyGet) {
      // プロパティとindexesを直接指定してgetする
      return (prop, indexes) => 
        Reflect.apply(this.directlyGet, this, [target, { prop, indexes }, receiver]);
    } else if (prop === Symbols$1.directlySet) {
      // プロパティとindexesを直接指定してsetする
      return (prop, indexes, value) => 
        Reflect.apply(this.directlySet, this, [target, { prop, indexes, value }, receiver]);
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
const Symbols = Object.assign({
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
  setBuffer: Symbol.for(`${name}:props.setBuffer`),
  getBuffer: Symbol.for(`${name}:props.getBuffer`),
  clearBuffer: Symbol.for(`${name}:props.clearBuffer`),
  createBuffer: Symbol.for(`${name}:props.createBuffer`),
  flushBuffer: Symbol.for(`${name}:props.flushBuffer`),
  toObject: Symbol.for(`${name}:props.toObject`),
  propInitialize: Symbol.for(`${name}:props.initialize`),

  isComponent: Symbol.for(`${name}:component.isComponent`),
}, Symbols$1);

/**
 * @type {{
 *   debug:Boolean,
 *   useShadowRoot:Boolean,
 *   useKeyed:Boolean,
 *   useWebComponent:Boolean,
 *   useLocalTagName:Boolean,
 * }}
 */
const config = {
  debug: false, // debug mode
  useShadowRoot: false, // use shadowroot
  useKeyed: true, // use keyed
  useWebComponent: true, // use web component
  useLocalTagName: true, // use local tag name
};

class utils {
  /**
   * 
   * @param {string} message 
   */
  static raise(message) {
    throw new Error(message);
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

class Templates {
  /** @type {Map<string,HTMLTemplateElement>} */
  static templateByUUID = new Map;

}

const DATASET_BIND_PROPERTY$3 = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

class Template {
  /**
   * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
   * @param {string|undefined} html 
   * @param {string|undefined} css
   * @param {string} componentUuid
   * @param {string[]} customComponentNames
   * @returns {HTMLTemplateElement}
   */
  static create(html, css, componentUuid, customComponentNames) {
    const template = document.createElement("template");
    template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? this.replaceTag(html, componentUuid, customComponentNames) : "");
    return template;
  }

  /**
   * HTMLの変換
   * {{loop:}}{{if:}}{{else:}}を<template>へ置換
   * {{end:}}を</template>へ置換
   * {{...}}を<!--@@:...-->へ置換
   * <template>を<!--@@|...-->へ置換
   * @param {string} html 
   * @param {string} componentUuid
   * @param {string[]} customComponentNames
   * @returns {string}
   */
  static replaceTag(html, componentUuid, customComponentNames) {
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
    const root = document.createElement("template"); // 仮のルート
    root.innerHTML = replacedHtml;
    // カスタムコンポーネントの名前を変更する
    const customComponentKebabNames = customComponentNames.map(customComponentName => utils.toKebabCase(customComponentName));
    const changeCustomElementName = (element) => {
      for(const customComponentKebabName of customComponentKebabNames) {
        /** @type {Element[]} */
        const replaceElements = Array.from(element.querySelectorAll(customComponentKebabName));
        for(const oldElement of replaceElements) {
          const newElement = document.createElement(`${customComponentKebabName}-${componentUuid}`);
          if (oldElement.hasAttributes) {
            for(const attr of oldElement.attributes) {
              newElement.setAttribute(attr.name, attr.value);
            }
            newElement.setAttribute("data-orig-tag-name", customComponentKebabName);
          }
          oldElement.parentNode.replaceChild(newElement, oldElement);
        }
        /** @type {Element[]} */
        const changeIsElements = Array.from(element.querySelectorAll(`[is="${customComponentKebabName}"]`));
        for(const oldElement of changeIsElements) {
          const newElement = document.createElement(oldElement.tagName, { is:`${customComponentKebabName}-${componentUuid}` });
          if (oldElement.hasAttributes) {
            for(const attr of oldElement.attributes) {
              if (attr.name === "is") continue;
              newElement.setAttribute(attr.name, attr.value);
            }
            newElement.setAttribute("data-orig-is", customComponentKebabName);
          }
          oldElement.parentNode.replaceChild(newElement, oldElement);
        }
      }
      const templates = Array.from(element.querySelectorAll("template"));
      for(const template of templates) {
        changeCustomElementName(template.content);
      }
    };
    if (customComponentKebabNames.length > 0) {
      changeCustomElementName(root.content);
    }

    // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
    /** @type {(element:HTMLElement)=>{}} */
    const replaceTemplate = (element) => {
      /** @type {HTMLTemplateElement} */
      let template;
      while(template = element.querySelector("template")) {
        const uuid =  utils.createUUID();
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

}

class Module {
  /** @type {string} */
  #uuid = utils.createUUID();
  get uuid() {
    return this.#uuid;
  }

  /** @type {string} */
  html = "";

  /** @type {string|undefined} */
  css;

  /** @type {HTMLTemplateElement} */
  get template() {
    const customComponentNames = (this.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.css, this.uuid, customComponentNames);
  }

  /** @type {ViewModel.constructor} */
  ViewModel = class {};

  /** @type {string|undefined} */
  extendTag;

  /** @type {boolean|undefined} */
  useWebComponent;

  /** @type {boolean|undefined} */
  useShadowRoot;

  /** @type {boolean|undefined} */
  useLocalTagName;

  /** @type {boolean|undefined} */
  useKeyed;

  /** @type {boolean|undefined} */
  useBufferedBind;

  /** @type {Object<string,FilterFunc>|undefined} */
  inputFilters;

  /** @type {Object<string,FilterFunc>|undefined} */
  outputFilters;

  /** @type {Object<string,Module>|undefined} */
  componentModules;

  /** @type {Object<string,Module>|undefined} */
  get componentModulesForRegist() {
    if (this.useLocalTagName ?? config.useLocalTagName) {
      // case of useLocalName with true,
      // subcompnents tag name convert to the name with uuid
      if (typeof this.componentModules !== "undefined") {
        /** @type {Object<string,Module>} */
        const componentModules = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules)) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}

let Handler$1 = class Handler {
  #component;
  #buffer;
  #binds = [];

  /**
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.#component = component;
  }

  get component() {
    return this.#component;
  }

  get buffer() {
    return this.#buffer;
  }

  /**
   * bind parent component's property
   * @param {string} prop 
   * @param {{name:string,indexes:number[]}|undefined} propAccess 
   */
  #bindProperty(prop, propAccess) {
    /**
     * return parent component's property getter function
     * @param {Handler} handler 
     * @param {string} name
     * @param {{name:string,indexes:number[]}} props 
     * @returns {()=>any}
     */
    const getFunc = (handler, name, props) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else {
        return handler.component.parentComponent.writableViewModel[Symbols.directlyGet](props.name, props.indexes);
      }
    };
    /**
     * return parent component's property setter function
     * @param {Handler} handler 
     * @param {string} name
     * @param {{name:string,indexes:number[]}} props 
     * @returns {(value:any)=>true}
     */
    const setFunc = (handler, name, props) => function (value) {
      if (typeof handler.buffer !== "undefined") {
        handler.buffer[name] = value;
      } else {
        handler.component.parentComponent.writableViewModel[Symbols.directlySet](props.name, props.indexes, value);
      }
      return true;
    };
    // define component's property
    Object.defineProperty(this.#component.baseViewModel, prop, {
      get: getFunc(this, prop, propAccess),
      set: setFunc(this, prop, propAccess),
      configurable: true,
    });
    if (typeof propAccess !== "undefined") {
      this.#binds.push({ prop, propAccess });
    }

  }

  #setBuffer(buffer) {
    this.#buffer = buffer;
    for(const key in buffer) {
      this.#bindProperty(key);
      this.#component.viewModel[Symbols.notifyForDependentProps](key, []);
    }
  }

  #getBuffer() {
    return this.#buffer;
  }

  #clearBuffer() {
    this.#buffer = undefined;
  }

  #createBuffer() {
    const buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      buffer[prop] = this.#component.parentComponent.writableViewModel[Symbols.directlyGet](propAccess.name, propAccess.indexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      this.#binds.forEach(({ prop, propAccess }) => {
        this.#component.parentComponent.writableViewModel[Symbols.directlySet](propAccess.name, propAccess.indexes, this.#buffer[prop]);     
      });
    }
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
      return (prop, propAccess) => this.#bindProperty(prop, propAccess);
    } else if (prop === Symbols.setBuffer) {
      return (buffer) => this.#setBuffer(buffer);
    } else if (prop === Symbols.getBuffer) {
      return () => this.#getBuffer();
    } else if (prop === Symbols.clearBuffer) {
      return () => this.#clearBuffer();
    } else if (prop === Symbols.createBuffer) {
      return () => this.#createBuffer();
    } else if (prop === Symbols.flushBuffer) {
      return () => this.#flushBuffer();
    }
    return this.#component.viewModel[prop];
  }

  /**
   * Proxy.set
   * @param {any} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    this.#component.viewModel[prop] = value;
    return true;
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

class ThreadStop extends Error {

}

class Thread {
  /** @type {Promises} */
  #promises;

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
    this.#promises = Promise.withResolvers();
    return this.#promises.promise;
  }

  /**
   * @returns {void}
   */
  stop() {
    this.#promises.reject(new ThreadStop("stop"));
  }

  /**
   * @param {UpdateSlot} slot 
   * @returns {void}
   */
  wakeup(slot) {
    this.#promises.resolve(slot);
  }

  /**
   * @returns {void}
   */
  async main() {
    do {
      try {
        const slot = await this.#sleep(); // wakeup(slot)が呼ばれるまで待機
        await slot.waitPromises.promise; // queueにデータが入るまで待機
        config.debug && performance.mark('slot-exec:start');
        try {
          await slot.exec();
          if (config.debug) {
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
   * @param {Set<PropertyAccess>} setOfSavePropertyAccessKeys 
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
        //if (curPropName.setOfParentPaths.has(propName.name)) continue;
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

class NodeUpdator {
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
      const propertyAccessByViewModelPropertyKey = notifies.concat(dependentPropertyAccesses).reduce(
        (/** @type {Map<string,PropertyAccess>} */ map, propertyAccess) => 
          map.set(propertyAccess.propName.name + "\t" + propertyAccess.indexes.toString(), propertyAccess), 
        new Map  
      );
      this.#component.updateNode(propertyAccessByViewModelPropertyKey);
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

  /** @type {NodeUpdator} */
  #nodeUpdator;
  /** @type {NodeUpdator} */
  get nodeUpdator() {
    return this.#nodeUpdator;
  }

  /** @type {()=>void} */
  #callback;

  /** @type {Resolvers} */
  #waitPromises;
  get waitPromises() {
    return this.#waitPromises;
  }

  /** @type {Resolvers} */
  #alivePromises;
  get alivePromises() {
    return this.#alivePromises;
  }

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
    this.#nodeUpdator = new NodeUpdator(component);
    this.#callback = callback;
    this.#changePhaseCallback = changePhaseCallback;
    this.#waitPromises = Promise.withResolvers();
    this.#alivePromises = Promise.withResolvers();
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.#viewModelUpdator.isEmpty && this.#nodeUpdator.isEmpty;
  }

  async exec() {
    do {
      this.phase = Phase.updateViewModel;
      await this.#viewModelUpdator.exec();

      this.phase = Phase.gatherUpdatedProperties;
      await this.#nodeUpdator.exec();

    } while(!this.#viewModelUpdator.isEmpty || !this.#nodeUpdator.isEmpty);

    this.phase = Phase.terminate;
    this.#alivePromises.resolve();
  }

  /**
   * 
   * @param {ProcessData} processData 
   */
  addProcess(processData) {
    this.#viewModelUpdator.queue.push(processData);
    this.#waitPromises.resolve(true); // waitingを解除する
  }
  
  /**
   * 
   * @param {PropertyAccess} notifyData 
   */
  addNotify(notifyData) {
    this.#nodeUpdator.queue.push(notifyData);
    this.#waitPromises.resolve(true); // waitingを解除する
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
  while(node.parentNode !== null) {
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
   * Get target node list from template
   * @param {HTMLTemplateElement|undefined} template 
   * @param {HTMLElement|undefined} rootElement
   * @returns {Node[]}
   */
  static getTargetNodes(template, rootElement) {
    (typeof template === "undefined") && utils.raise("Selector: template is undefined");
    (typeof rootElement === "undefined") && utils.raise("Selector: rootElement is undefined");

    /** @type {Node[]} */
    let nodes;

    /** @type {number[][]} */
    const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
    if (typeof listOfRouteIndexes !== "undefined") {
      // キャッシュがある場合
      // querySelectorAllを行わずにNodeの位置を特定できる
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
  static register(name, outputFilter, inputFilter) {
    if (name in outputFilters) utils.raise(`register filter error duplicate name (${name})`);
    if (name in inputFilters) utils.raise(`register filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
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

  /** @type {boolean} */
  get loopable() {
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
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
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
   * 更新後処理
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  postUpdate(propertyAccessByViewModelPropertyKey) {
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return this.value === value;
  }

  /**
   * @param {Set<number>} setOfIndex
   */
  applyToChildNodes(setOfIndex) {
  }

  clearValue() {
  }
}

const PREFIX$3 = "@@|";

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
    return node.textContent.slice(PREFIX$3.length);
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
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    const uuid = TemplateProperty.getUUID(node);
    const template = Templates.templateByUUID.get(uuid);
    if (typeof template === "undefined") utils.raise(`TemplateProperty: invalid uuid ${uuid}`);
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
  /** @type {boolean} */
  get loopable() {
    return true;
  }

  /** @type {number} */
  get value() {
    return this.binding.children.length;
  }
  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise("Repeat: value is not array");
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const [ name, index ] = [this.binding.viewModelProperty.name, newIndex]; 
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding, { name, index });
        this.binding.appendChild(bindingManager);
        bindingManager.registerBindingsToSummary();
        bindingManager.applyToNode();
      }
    } else if (this.value > value.length) {
      const removeBindingManagers = this.binding.children.splice(value.length);
      this.binding.children.forEach(applyToNodeFunc);
      removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
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
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
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
  get value() {
    return this.binding.children.length > 0;
  }
  /** @param {boolean} value */
  set value(value) {
    if (typeof value !== "boolean") utils.raise("Branch: value is not boolean");
    if (this.value !== value) {
      if (value) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.registerBindingsToSummary();
      } else {
        const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
        removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
      }
    }
    this.binding.children.forEach(bindingManager => bindingManager.applyToNode());
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
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
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
  #propertyName;
  get propertyName() {
    return this.#propertyName;
  }

  #level;
  get level() {
    return this.#level;
  }

  /** @type {number[]} */
  get indexes() {
    return this.binding.loopContext?.indexes.slice(0 , this.level) ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  get key() {
    return this.name + "\t" + this.indexesString;
  }

  #oldKey;
  get oldKey() {
    return this.#oldKey;
  }

  get isChagedKey() {
    return this.#oldKey !== this.key;
  }

  getKey() {
    this.#oldKey = this.key;
    return this.key;
  }

  /** @type {any} */
  get value() {
    return this.viewModel[Symbols.directlyGet](this.name, this.indexes);
  }
  set value(value) {
    const setValue = value => {
      this.viewModel[Symbols.directlySet](this.name, this.indexes, value);
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
    this.#propertyName = PropertyName.create(this.name);
    this.#level = this.#propertyName.level;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  getChildValue(index) {
    return this.viewModel[Symbols.directlyGet](`${this.name}.*` , this.indexes.concat(index));
  }

  setChildValue(index, value) {
    return this.viewModel[Symbols.directlySet](`${this.name}.*` , this.indexes.concat(index), value);
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
    return this.binding.loopContext.allIndexes[this.index];
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
    if (!regexp$1.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
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
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters, inputFilterFuncs);
  }
}

const NAME = "class";

class ElementClassName extends ElementBase {
  /** @type {any} */
  get value() {
    return this.element.className.length > 0 ? this.element.className.split(" ") : [];
  }
  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise("ElementClassName: value is not array");
    this.element.className = value.join(" ");
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
    if (name !== NAME) utils.raise(`ElementClassName: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }
}

class Checkbox extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {MultiValue} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }

  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise("Checkbox: value is not array");
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = value.find(v => v === multiValue.value) ? true : false;
  }

  /** @type {MultiValue} */
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
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("Checkbox: not checkbox");
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
    return this.element;
  }

  /** @type {MultiValue} */
  get value() {
    return new MultiValue(this.inputElement.value, this.inputElement.checked);
  }
  /** @param {any} value */
  set value(value) {
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  /** @type {MultiValue} */
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
    if (!(node instanceof HTMLInputElement)) utils.raise("Radio: not htmlInputElement");
    if (node.type !== "radio") utils.raise("Radio: not radio");
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}

const PREFIX$2 = "on";

class ElementEvent extends ElementBase {
  /** @type {string} nameのonの後ろを取得する */
  get eventType() {
    return this.name.slice(PREFIX$2.length); // on～
  }

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return false;
  }

  /**
   * @type {(event:Event)=>{}} イベントハンドラ
   */
  #handler;
  get handler() {
    if (typeof this.#handler === "undefined") {
      this.#handler = event => this.eventHandler(event);
    }
    return this.#handler;
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
    if (!name.startsWith(PREFIX$2)) utils.raise(`ElementEvent: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.element.addEventListener(this.eventType, this.handler);
  }

  /**
   * 
   * @param {Event} event
   */
  async directlyCall(event) {
    const { viewModelProperty, loopContext } = this.binding;
    return viewModelProperty.viewModel[Symbols.directlyCall](viewModelProperty.name, loopContext, event);
  }
  /**
   * 
   * @param {Event} event
   */
  createProcessData(event) {
    return new ProcessData(this.directlyCall, this, [event]);
  }

  /**
   * 
   * @param {Event} event
   */
  eventHandler(event) {
    // 再構築などでバインドが削除されている場合は処理しない
    if (!this.binding.component.bindingSummary.allBindings.has(this.binding)) return;
    event.stopPropagation();
    const processData = this.createProcessData(event);
    this.binding.component.updateSlot.addProcess(processData);
  }
}

const PREFIX$1 = "class.";

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

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!name.startsWith(PREFIX$1)) utils.raise(`ElementClass: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
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
    if (!(node instanceof HTMLElement)) utils.raise("ElementStyle: not htmlElement");
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

class BindingPropertyAccess {
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
    if (!(node.constructor[Symbols.isComponent])) utils.raise("ComponentProperty: not Component");
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.thisComponent.props[Symbols.bindProperty](this.propName, new BindingPropertyAccess(this.binding.viewModelProperty));
  }

  /**
   * 更新後処理
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  postUpdate(propertyAccessByViewModelPropertyKey) {
    const viewModelProperty = this.binding.viewModelProperty.name;
    const propName = this.propName;
    for(const [key, propertyAccess] of propertyAccessByViewModelPropertyKey.entries()) {
      if (propertyAccess.propName.name === viewModelProperty || propertyAccess.propName.setOfParentPaths.has(viewModelProperty)) {
        const remain = propertyAccess.propName.name.slice(viewModelProperty.length);
        this.thisComponent.viewModel?.[Symbols.writeCallback](`${propName}${remain}`, propertyAccess.indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`${propName}${remain}`, propertyAccess.indexes);
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

class RepeatKeyed extends Repeat {
  /** @type {boolean} */
  get loopable() {
    return true;
  }

  /** @type {any[]} */
  #lastValue = [];

  /** @type {number} */
  get value() {
    return this.#lastValue;
  }
  set value(values) {
    if (!Array.isArray(values)) utils.raise("RepeatKeyed: value is not array");
    const fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    const lastIndexes = new Set;
    
    /** @type {BindingManager[]} */
    let beforeBindingManager;
    /** @type {Set<number>} */
    const setOfNewIndexes = new Set;
    /** @type {Map<number,number>} */
    const lastIndexByNewIndex = new Map;
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
      const value = this.binding.viewModelProperty.getChildValue(newIndex);
      const lastIndex = this.#lastValue.indexOf(value, fromIndexByValue.get(value) ?? 0);
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        setOfNewIndexes.add(newIndex);
      } else {
        // 元のインデックスがある場合（既存）
        fromIndexByValue.set(value, lastIndex + 1); // 
        lastIndexes.add(lastIndex);
        lastIndexByNewIndex.set(newIndex, lastIndex);
      }
    }
    for(let i = 0; i < this.binding.children.length; i++) {
      if (lastIndexes.has(i)) continue;
      this.binding.children[i].dispose();
    }
    const newBindingManagers = values.map((value, newIndex) => {
      /** @type {BindingManager} */
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      const parentNode = this.node.parentNode;
      if (setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        const [ name, index ] = [ this.binding.viewModelProperty.name, newIndex ];
        bindingManager = BindingManager.create(this.binding.component, this.template, this.binding, { name, index });
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
      } else {
        // 元のインデックスがある場合（既存）
        const lastIndex = lastIndexByNewIndex.get(newIndex);
        bindingManager = this.binding.children[lastIndex];
        if (bindingManager.nodes) {
          if (bindingManager.nodes[0].previousSibling !== beforeNode) {
            bindingManager.removeNodes();
            parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
          }
        }
      }
      beforeBindingManager = bindingManager;
      return bindingManager;
    });

    this.binding.children.splice(0, this.binding.children.length, ...newBindingManagers);
    newBindingManagers.forEach(bindingManager => {
      bindingManager.registerBindingsToSummary();
      bindingManager.applyToNode();
    });
    this.#lastValue = values.slice();
  }

  /**
   * @param {Set<number>} setOfIndex
   */
  applyToChildNodes(setOfIndex) {
    /** @type {Map<any,BindingManager>} */
    const bindingManagerByValue = new Map;
    for(const index of setOfIndex) {
      const bindingManager = this.binding.children[index];
      if (typeof bindingManager === "undefined") continue;
      bindingManager.removeNodes();
      const oldValue = this.#lastValue[index];
      if (typeof oldValue !== "undefined") {
        bindingManagerByValue.set(oldValue, bindingManager);
      }
    }
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.viewModelProperty.getChildValue(index);
      if (typeof newValue === "undefined") continue;
      let bindingManager = bindingManagerByValue.get(newValue);
      if (typeof bindingManager === "undefined") {
        const name = this.binding.viewModelProperty.name;
        bindingManager = BindingManager.create(this.binding.component, this.template, this.binding, {name, index});
      }
      this.binding.replaceChild(index, bindingManager);
      bindingManager.registerBindingsToSummary();
      bindingManager.applyToNode();
    }
  }

  clearValue() {
    this.#lastValue = [];
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
      if (isComment && nodePropertyName === "loop") {
        classOfNodeProperty = bindingManager.component.useKeyed ? RepeatKeyed : Repeat;
        break;
      }
      if (isComment) utils.raise(`Factory: unknown node property ${nodePropertyName}`);
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
    
    return Binding.create(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty, 
      filters);
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
    typeof nodeProperty === "undefined" && utils.raise("parseBindText: default property undefined");
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
    (typeof text === "undefined") && utils.raise("Parser: text is undefined");
    if (text.trim() === "") return [];
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
   * Generate a list of binding objects from a string
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   * @param {Node} node node
   * @param {ViewModel} viewModel view model
   * @param {string|undefined} text the string specified in the "data-bind" attribute.
   * @param {string|undefined} defaultName default property name of node
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static parseBindText = (bindingManager, node, viewModel, text, defaultName) => {
    (typeof text === "undefined") && utils.raise(`BindToDom: text is undefined`);
    if (text.trim() === "") return [];
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
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`BindToHTMLElement: not HTMLElement`);

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLButtonElement ? "onclick" : 
  element instanceof HTMLAnchorElement ? "onclick" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : (element.type === "button" ? "onclick" : "value")) : 
  DEFAULT_PROPERTY$1;
  
};

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));


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
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$2) ?? undefined;
    (typeof bindText === "undefined") && utils.raise(`BindToHTMLElement: data-bind is not defined`);
    element.removeAttribute(DATASET_BIND_PROPERTY$2);
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
      if (!hasDefaultEvent) {
        setDefaultEventHandler(radioBinding);
      }
    } else if (checkboxBinding) {
      if (!hasDefaultEvent) {
        setDefaultEventHandler(checkboxBinding);
      }
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
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`BindToSVGElement: not SVGElement`);

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
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY$1) ?? undefined;
    (typeof bindText === "undefined") && utils.raise(`BindToSVGElement: data-bind is not defined`);

    element.removeAttribute(DATASET_BIND_PROPERTY$1);
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
const toComment$1 = node => (node instanceof Comment) ? node : utils.raise("BindToText: not Comment");

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
    const parentNode = comment.parentNode ?? undefined;
    (typeof parentNode === "undefined") && utils.raise("BindToText: no parent");
    /** @type {string} */
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    if (bindText.trim() === "") return [];
    /** @type {Text} */
    const textNode = document.createTextNode("");
    parentNode.replaceChild(textNode, comment);

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
const toComment = node => (node instanceof Comment) ? node : utils.raise("BindToTemplate: not Comment");

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
    (typeof template === "undefined") && utils.raise(`BindToTemplate: template not found`);
    /** @type {string} */
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY) ?? undefined;
    (typeof bindText === "undefined") && utils.raise(`BindToTemplate: data-bind is not defined`);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, undefined);

    return bindings;
  }
}

class Binder {
  /**
   * Generate a list of binding objects from a list of nodes
   * @param {import("../binding/Binding.js").BindingManager} bindingManager parent binding manager
   * @param {Node[]} nodes node list having data-bind attribute
   * @returns {import("../binding/Binding.js").Binding[]} generate a list of binding objects 
   */
  static bind(bindingManager, nodes) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(bindingManager, node) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(bindingManager, node) :
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(bindingManager, node) : 
      (node instanceof SVGElement) ? BindToSVGElement.bind(bindingManager, node) :
      utils.raise(`Binder: unknown node type`)
    );
  }

}

class ReuseBindingManager {
  /** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
  static #bindingManagersByTemplate = new Map;

  /**
   * 
   * @param {import("./Binding.js").BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    bindingManager.removeNodes();
    bindingManager.parentBinding = undefined;
    bindingManager.bindings.forEach(binding => {
      binding.nodeProperty.clearValue();
      bindingManager.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.dispose());
    });
    if (!bindingManager.component.useKeyed) {
      this.#bindingManagersByTemplate.get(bindingManager.template)?.push(bindingManager) ??
        this.#bindingManagersByTemplate.set(bindingManager.template, [bindingManager]);
    }
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding, loopInfo) {
    let bindingManager = this.#bindingManagersByTemplate.get(template)?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, parentBinding, loopInfo);
      bindingManager.initialize();
    } else {
      bindingManager.parentBinding = parentBinding;
    }
    return bindingManager;
  }

}

class LoopContext {
  /** @type {import("../binding/Binding.js").BindingManager} */
  #bindingManager;

  /** @type {import("../binding/Binding.js").BindingManager} */
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type {import("../binding/Binding.js").BindingManager|undefined} */
  get parentBindingManager() {
    return this.bindingManager.parentBinding?.bindingManager;
  }

  /** @type {import("../binding/Binding.js").Binding|undefined} */
  get binding() {
    return this.bindingManager.parentBinding;
  }

  /** @type {import("../binding/Binding.js").BindingManager|undefined} */
  get nearestBindingManager() {
    const prop = PropertyName.create(this.name); // ex. "list.*.detail.names.*"
    if (prop.level <= 0) return;
    const parentProp = PropertyName.create(prop.nearestWildcardParentName); // ex. "list.*.detail.names"
    const searchName = parentProp.name; // ex. "list"
    let curBindingManager = this.parentBindingManager;
    while(typeof curBindingManager !== "undefined") {
      if (curBindingManager.loopContext.binding.viewModelProperty.name === searchName) {
        return curBindingManager;
      }
      curBindingManager = curBindingManager.loopContext.parentBindingManager;
    }
  }

  /** @type {NewLoopContext|undefined} */
  get nearestLoopContext() {
    return this.nearestBindingManager?.loopContext;
  }

  /** @type {number} */
  get _index() {
    return this.binding.children.indexOf(this.#bindingManager);    
  }

  /** @type {number} */
  get index() {
    if (this.binding?.loopable) {
      return this._index;
    } else {
      // 上位のループコンテキストのインデックスを取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.index ?? -1;
    }
  }

  /** @type {string} */
  get name() {
    if (this.binding?.loopable) {
      return this.binding.viewModelProperty.name;
    } else {
      // 上位のループコンテキストの名前を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.name ?? "";
    }
  }

  /** @type {number[]} */
  get indexes() {
    if (this.binding?.loopable) {
      return this.nearestLoopContext?.indexes.concat(this.index) ?? [this.index];
    } else {
      // 上位のループコンテキストのインデクッス配列を取得
      const parentLoopContext = this.parentBindingManager?.loopContext;
      return parentLoopContext?.indexes ?? [];
    }
  }

  /** @type {number[]} */
  get allIndexes() {
    if (typeof this.binding === "undefined") return [];
    const index = (this.binding.loopable) ? this._index : -1;
    const indexes = this.parentBindingManager.loopContext.allIndexes;
    return (index >= 0) ? indexes.concat(index) : indexes;
  }

  /**
   * 
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   */
  constructor(bindingManager) {
    this.#bindingManager = bindingManager;
  }

  /**
   * 
   * @param {string} name 
   * @returns {NewLoopContext|undefined}
   */
  find(name) {
    let loopContext = this;
    while(typeof loopContext !== "undefined") {
      if (loopContext.name === name) return loopContext;
      loopContext = loopContext.parentBindingManager.loopContext;
    }
  }
}

class Binding {
  /** @type {number} */
  static seq = 0;

  /** @type {number} id */
  #id;
  get id() {
    return this.#id;
  }

  /** @type {BindingManager} parent binding manager */
  #bindingManager;
  get bindingManager() {
    return this.#bindingManager;
  }

  /** @type { import("./nodeProperty/NodeProperty.js").NodeProperty } node property */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty
  }

  /** @type { import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty } viewmodel property */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }

  /** @type {Component} component */
  get component() {
    return this.#bindingManager.component;
  }

  /** @type {LoopContext} new loop context */
  get loopContext() {
    return this.#bindingManager.loopContext;
  }

  /** @type { BindingManager[] } child bindingManager for branch/repeat */
  #children = [];
  get children() {
    return this.#children;
  }

  /** @type {boolean} branch/repeat is true */
  get expandable() {
    return this.nodeProperty.expandable;
  }

  /** @type {boolean} repeat is true */
  get loopable() {
    return this.nodeProperty.loopable;
  }

  /** @type {boolean} for select tag value */
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
  constructor(bindingManager,
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
   * apply value to node
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty } = this;
    if (component.bindingSummary.updatedBindings.has(this)) return;
    try {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
      nodeProperty.value = filteredViewModelValue;
    } finally {
      component.bindingSummary.updatedBindings.add(this);
    }
  }

  /**
   * apply value to child nodes
   * @param {Set<number>} setOfIndex 
   */
  applyToChildNodes(setOfIndex) {
    this.nodeProperty.applyToChildNodes(setOfIndex);

  }

  /**
   * ViewModelへ値を反映する
   * apply value to ViewModel
   */
  applyToViewModel() {
    const { viewModelProperty, nodeProperty } = this;
    if (!viewModelProperty.applicable) return;
    viewModelProperty.value = nodeProperty.filteredValue;
  }

  /**
   * 
   * @param {Event} event 
   */
  execDefaultEventHandler(event) {
    if (!this.component.bindingSummary.allBindings.has(this)) return;
    event.stopPropagation();
    const process = new ProcessData(this.applyToViewModel, this, []);
    this.component.updateSlot.addProcess(process);
  }

  /** @type {(event:Event)=>void} */
  #defaultEventHandler;
  get defaultEventHandler() {
    if (typeof this.#defaultEventHandler === "undefined") {
      this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
    }
    return this.#defaultEventHandler;
  }

  /**
   * initialize
   */
  initialize() {
    this.nodeProperty.initialize();
    this.viewModelProperty.initialize();
  }

  /**
   * @param {BindingManager} bindingManager
   */
  appendChild(bindingManager) {
    if (!this.expandable) utils.raise("Binding.appendChild: not expandable");
    const lastChild = this.children[this.children.length - 1];
    this.children.push(bindingManager);
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   * 
   * @param {number} index 
   * @param {BindingManager} bindingManager 
   */
  replaceChild(index, bindingManager) {
    if (!this.expandable) utils.raise("Binding.replaceChild: not expandable");
    const lastChild = this.children[index - 1];
    this.children[index] = bindingManager;
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   * create Binding
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
    const binding = new Binding(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty,
      filters
    );
    binding.initialize();
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
    return this.#nodes[this.#nodes.length - 1];
  }

  /** @type {DocumentFragment} */
  #fragment;
  get fragment() {
    return this.#fragment;
  }

  /** @type {LoopContext} */
  #loopContext;
  get loopContext() {
    return this.#loopContext;
  }

  /** @type {HTMLTemplateElement} */
  #template;
  get template() {
    return this.#template;
  }

  /** @type {Binding} */
  #parentBinding;
  get parentBinding() {
    return this.#parentBinding;
  }
  set parentBinding(value) {
    this.#parentBinding = value;
  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   */
  constructor(component, template, parentBinding, loopInfo) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
  }

  /**
   * 
   */
  initialize() {
    const content = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(this.#template, content);
    this.#bindings = Binder.bind(this, nodes);
    this.#nodes = Array.from(content.childNodes);
    this.#fragment = content;
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    this.#bindings.forEach(binding => this.#component.bindingSummary.add(binding));
  }

  /**
   * apply value to node
   */
  applyToNode() {
    const selectBindings = new Set;
    for(const binding of this.bindings) {
      binding.isSelectValue ? selectBindings.add(binding) : binding.applyToNode();
    }
    for(const binding of selectBindings) {
      binding.applyToNode();
    }
  }

  /**
   * apply value to ViewModel
   */
  applyToViewModel() {
    this.bindings.forEach(binding => binding.applyToViewModel());
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    this.#nodes.forEach(node => this.fragment.appendChild(node));
  }

  /**
   * 
   */
  dispose() {
    ReuseBindingManager.dispose(this);
  }

  /**
   * updated viewModel properties are updated to node properties
   * @param {BindingManager} bindingManager
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  static updateNode(bindingManager, propertyAccessByViewModelPropertyKey) {
    const { bindingSummary } = bindingManager.component;
    bindingSummary.initUpdate();

    // expandable bindings are expanded first
    // bind tree structure is determined
    const expandableBindings = Array.from(bindingSummary.expandableBindings);
    expandableBindings.sort((bindingA, bindingB) => {
      const result = bindingA.viewModelProperty.propertyName.level - bindingB.viewModelProperty.propertyName.level;
      if (result !== 0) return result;
      const result2 = bindingA.viewModelProperty.propertyName.pathNames.length - bindingB.viewModelProperty.propertyName.pathNames.length;
      return result2;
    });
    for(const binding of expandableBindings) {
      if (!propertyAccessByViewModelPropertyKey.has(binding.viewModelProperty.key)) continue;
      binding.applyToNode();
    }
    bindingSummary.flush();

    const setOfIndexByParentKey = new Map;
    for(const propertyAccess of propertyAccessByViewModelPropertyKey.values()) {
      if (propertyAccess.propName.lastPathName !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.propName.parentPath + "\t" + propertyAccess.indexes.slice(0, propertyAccess.indexes.length - 1);
      setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
    }
    for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
      const bindings = bindingSummary.bindingsByKey.get(parentKey) ?? new Set;
      for(const binding of bindings) {
        if (bindingSummary.updatedBindings.has(binding)) continue;
        if (!binding.expandable) continue;
        binding.applyToChildNodes(setOfIndex);
      }
    }

    const selectBindings = new Set;
    for(const key of propertyAccessByViewModelPropertyKey.keys()) {
      for(const binding of bindingSummary.bindingsByKey.get(key) ?? new Set) {
        if (binding.expandable) continue;
        binding.isSelectValue ? selectBindings.add(binding) : binding.applyToNode();
      }
    }
    for(const binding of selectBindings) {
      binding.applyToNode();
    }
    for(const binding of bindingSummary.componentBindings) {
      binding.nodeProperty.postUpdate(propertyAccessByViewModelPropertyKey);
    }

  }

  /**
   * create BindingManager
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding, loopInfo) {
    const bindingManager = ReuseBindingManager.create(component, template, parentBinding, loopInfo);
    return bindingManager;
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
  [Symbols.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols.writeCallback]: WRITE_CALLBACK,
};

/**
 * @type {Set<symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols.connectedCallback,
  Symbols.disconnectedCallback,
  Symbols.writeCallback,
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
    if (prop === Symbols.connectedCallback) {
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
  Symbols.directlyCall,
  Symbols.getDependentProps,
  Symbols.notifyForDependentProps,
  Symbols.clearCache,
]);

/**
 * @type {Object<symbol,({viewModel:ViewModel,viewModelProxy:Proxy,handler:ViewModelHandlerBase})=>()>}
 */
const callFuncBySymbol = {
  [Symbols.directlyCall]:({viewModel, viewModelProxy, handler}) => async (prop, loopContext, event) => 
    handler.directlyCallback(loopContext, async () => 
      Reflect.apply(viewModel[prop], viewModelProxy, [event, ...(loopContext?.allIndexes ?? [])])
    ),
  [Symbols.notifyForDependentProps]:({viewModel, viewModelProxy, handler}) => (prop, indexes) => 
    handler.addNotify(viewModel, { propName:PropertyName.create(prop), indexes }, viewModelProxy),
  [Symbols.getDependentProps]:({handler}) => () => handler.dependentProps,
  [Symbols.clearCache]:({handler}) => () => handler.cache.clear(),
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

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY$1 = "$dependentProps";
const COMPONENT_PROPERTY = "$component";

/**
 * @type {Set<string>}
 */
const setOfProperties = new Set([
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY$1,
  COMPONENT_PROPERTY,
]);

/**
 * @type {Object<string,({component:Component, viewModel:ViewModel})=>{}>}
 */
const getFuncByName = {
  [GLOBALS_PROPERTY]: ({component}) => component.globals,
  [DEPENDENT_PROPS_PROPERTY$1]: ({viewModel}) => viewModel[DEPENDENT_PROPS_PROPERTY$1],
  [COMPONENT_PROPERTY]: ({component}) => component,
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
    return this.#valueByIndexesStringByPropertyName.get(propName)?.get(indexes.toString()) ?? undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number[]} indexes 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexes, value) {
    this.#valueByIndexesStringByPropertyName.get(propName)?.set(indexes.toString(), value) ?? 
      this.#valueByIndexesStringByPropertyName.set(propName, new Map([[indexes.toString(), value]]));
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
      if (!propName.isPrimitive || this.setOfAccessorProperties.has(propName.name)) {
          // プリミティブじゃないもしくはアクセサプロパティ場合、キャッシュから取得する
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
    utils.raise("ReadOnlyViewModelHandler: viewModel is read only");
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
    utils.raise("ReadOnlyViewModelHandler: viewModel is read only");
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
  /** @type {LoopContext} */
  #loopContext;
  get loopContext() {
    return this.#loopContext;
  }

  /**
   * 
   * @param {LoopContext} loopContext 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async callback(loopContext, directlyCallback) {
    if (typeof this.#loopContext !== "undefined") utils.raise("DirectlyCallContext: already set loopContext");
    this.#loopContext = loopContext;
    try {
      return await directlyCallback();
    } finally {
      this.#loopContext = undefined;
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
    receiver[Symbols.writeCallback](propName.name, indexes);
    this.addNotify(target, { propName, indexes }, receiver);

    return result;
  }

  /**
   * 
   * @param {import("../loopContext/LoopContext.js").LoopContext} loopContext 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async directlyCallback(loopContext, directlyCallback) {
    return this.#directlyCallContext.callback(loopContext, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      this.stackIndexes.push(undefined);
      try {
        return await directlyCallback();
      } finally {
        this.stackIndexes.pop();
      }
    });
  }

  /**
   * 
   * @param {string} prop 
   * @returns {import("../loopContext/LoopContext.js").LoopContext | undefined}
   */
  findLoopContext(prop) {
    if (typeof this.#directlyCallContext.loopContext === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const propName = PropertyName.create(prop);
    if (propName.level === 0 || prop.at(0) === "@") return;
    const loopContext = this.#directlyCallContext.loopContext.find(propName.nearestWildcardParentName);
    if (typeof loopContext === "undefined") utils.raise(`WritableViewModelHandler: ${prop} is outside loop`);
    return loopContext;
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
      const loopContext = this.findLoopContext(prop);
      return (typeof loopContext !== "undefined") ?
        this.directlyGet(target, { prop, indexes:loopContext.allIndexes}, receiver) :
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
    const loopContext = this.findLoopContext(prop);
    return (typeof loopContext !== "undefined") ?
      this.directlySet(target, { prop, indexes:loopContext.allIndexes, value}, receiver) :
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
    "base": viewModel,
  };
}

/**
 * BindingSummary
 */
class BindingSummary {
  /** @type {boolean} */
  #updated = false;
  get updated() {
    return this.#updated;
  }
  set updated(value) {
    this.#updated = value;
  }

  /** @type {number} */
  #updateRevision = 0;
  get updateRevision() {
    return this.#updateRevision;
  }

  /** @type {Map<string,Binding[]>} viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す */
  #bindingsByKey = new Map;
  get bindingsByKey() {
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} if/loopを持つbinding */
  #expandableBindings = new Set;
  get expandableBindings() {
    return this.#expandableBindings;
  }

  /** @type {Set<Binding} componentを持つbinding */
  #componentBindings = new Set;
  get componentBindings() {
    return this.#componentBindings;
  }

  /** @type {Set<Binding>} 仮削除用のbinding、flush()でこのbindingの削除処理をする */
  #deleteBindings = new Set;

  /** @type {Set<Binding>} 全binding */
  #allBindings = new Set;
  get allBindings() {
    return this.#allBindings;
  }

  /** @type {Set<Binding>} 更新したbinding */
  #updatedBindings = new Set;
  get updatedBindings() {
    return this.#updatedBindings;
  }

  /**
   * 
   */
  initUpdate() {
    this.#updated = false;
    this.#updateRevision++;
    this.#updatedBindings = new Set;
  }
  
  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    this.#updated = true;
    if (this.#deleteBindings.has(binding)) {
      this.#deleteBindings.delete(binding);
      return;
    }
    this.#allBindings.add(binding);
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    this.#updated = true;
    this.#deleteBindings.add(binding);
  }

  /**
   * 
   */
  flush() {
    config.debug && performance.mark('BindingSummary.flush:start');
    try {
      if (!this.#updated) {
        return;
      }
      const bindings = Array.from(this.#allBindings).filter(binding => !this.#deleteBindings.has(binding));
      this.rebuild(bindings);
      this.#deleteBindings = new Set;
    } finally {
      if (config.debug) {
        performance.mark('BindingSummary.flush:end');
        performance.measure('BindingSummary.flush', 'BindingSummary.flush:start', 'BindingSummary.flush:end');
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures('BindingSummary.flush');
        performance.clearMarks('BindingSummary.flush:start');
        performance.clearMarks('BindingSummary.flush:end');
      }

    }
  }

  /**
   * 
   * @param {Binding[]} bindings 
   */
  rebuild(bindings) {
    this.#allBindings = new Set(bindings);
    this.#bindingsByKey = Map.groupBy(bindings, binding => binding.viewModelProperty.key);
    this.#expandableBindings = new Set(bindings.filter(binding => binding.nodeProperty.expandable));
    this.#componentBindings = new Set(bindings.filter(binding => binding.nodeProperty.constructor === ComponentProperty));
    this.#deleteBindings = new Set;
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
    if (node.constructor[Symbols.isComponent]) return node;
    if (node instanceof ShadowRoot) {
      if (node.host.constructor[Symbols.isComponent]) return node.host;
      node = node.host;
    }
    const component = pseudoComponentByNode.get(node);
    if (typeof component !== "undefined") return component;
  } while(true);
};

/** @type {ComponentBase} */
const mixInComponent = {
  /** @type {ViewModelProxy} view model proxy */
  get baseViewModel() {
    return this._viewModels["base"];
  },
  /** @type {ViewModelProxy} view model proxy */
  get writableViewModel() {
    return this._viewModels["writable"];
  },
  /** @type {ViewModelProxy} view model proxy */
  get readOnlyViewModel() {
    return this._viewModels["readonly"];
  },
  /** @type {ViewModelProxy} view model proxy */
  get viewModel() {
    if (typeof this.updateSlot === "undefined" || 
      (this.updateSlot.phase !== Phase.gatherUpdatedProperties)) {
      return this.writableViewModel;
    } else {
      return this.readOnlyViewModel;
    }
  },

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  },
  set rootBinding(value) {
    this._rootBinding = value;
  },

  /** @type {Thread} thread */
  get thread() {
    return this._thread;
  },
  set thread(value) {
    this._thread = value;
  },

  /** @type {UpdateSlot} update slot */
  get updateSlot() {
    if (typeof this._thread === "undefined") {
      return undefined;
    }
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, phase => {
        if (phase === Phase.gatherUpdatedProperties) {
          this.viewModel[Symbols.clearCache]();
        }
      });
      this.thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  },
  // for unit test mock
  set updateSlot(value) {
    this._updateSlot = value;
  },

  /** @type {Object<string,any>} parent component property */
  get props() {
    return this._props;
  },
  set props(value) {
    for(const [key, keyValue] of Object.entries(value)) {
      this._props[key] = keyValue;
    }
  },

  /** @type {Object<string,any>} global object */
  get globals() {
    return this._globals;
  },

  /** @type {Promises} initial promises */
  get initialPromises() {
    return this._initialPromises;
  },

  /** @type {Promises} alive promises */
  get alivePromises() {
    return this._alivePromises;
  },
  set alivePromises(value) {
    this._alivePromises = value;
  },

  /** @type {Component} parent component */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  },

  /** @type {boolean} use shadowRoot */
  get useShadowRoot() {
    return this._useShadowRoot;
  },

  /** @type {boolean} use web component */
  get useWebComponent() {
    return this._useWebComponent;
  },

  /** @type {boolean} use local tag name */
  get useLocalTagName() {
    return this._useLocalTagName;
  },

  /** @type {boolean} use keyed */
  get useKeyed() {
    return this._useKeyed;
  },

  /** @type {boolean} use buffered bind */
  get useBufferedBind() {
    return this._useBufferedBind;
  },

  /** @type {ShadowRoot|HTMLElement} view root element */
  get viewRootElement() {
    return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode;
  },

  /** @type {Node} parent node（use, case of useWebComponent is false） */
  get pseudoParentNode() {
    return !this.useWebComponent ? this._pseudoParentNode : utils.raise("mixInComponent: useWebComponent must be false");
  },

  /** @type {Node} pseudo node（use, case of useWebComponent is false） */
  get pseudoNode() {
    return this._pseudoNode;
  },

  /** @type {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}} filters */
  get filters() {
    return this._filters;
  },

  /** @type {BindingSummary} binding summary */
  get bindingSummary() {
    return this._bindingSummary;
  },

  /** 
   * initialize
   * @param {{
   * useWebComponent: boolean,
   * useShadowRoot: boolean,
   * useLocalTagName: boolean,
   * useKeyed: boolean,
   * useBufferedBind: boolean
   * }} param0
   * @returns {void}
   */
  initialize({
    useWebComponent, useShadowRoot, useLocalTagName, useKeyed, useBufferedBind
  }) {
    /**
     * set members
     */
    this._viewModels = createViewModels(this, this.constructor.ViewModel); // create view model
    this._rootBinding = undefined;
    this._thread = undefined;
    this._updateSlot = undefined;
    this._props = createProps(this); // create property for parent component connection
    this._globals = createGlobals(); // create property for global connection
    this._initialPromises = undefined;
    this._alivePromises = undefined;

    this._parentComponent = undefined;

    this._useShadowRoot = useShadowRoot;
    this._useWebComponent = useWebComponent;
    this._useLocalTagName = useLocalTagName;
    this._useKeyed = useKeyed;
    this._useBufferedBind = useBufferedBind;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this._bindingSummary = new BindingSummary;

    this._initialPromises = Promise.withResolvers(); // promises for initialize
  },

  /**
   * build component (called from connectedCallback)
   * setting filters
   * create and attach shadowRoot
   * create thread
   * initialize view model
   * @returns {void}
   */
  async build() {
//    console.log(`components[${this.tagName}].build`);
    const { template, inputFilters, outputFilters } = this.constructor; // from static members
    // setting filters
    if (typeof inputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(inputFilters)) {
        if (name in this.filters.in) utils.raise(`mixInComponent: already exists filter ${name}`);
        this.filters.in[name] = filterFunc;
      }
    }
    if (typeof outputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(outputFilters)) {
        if (name in this.filters.out) utils.raise(`mixInComponent: already exists filter ${name}`);
        this.filters.out[name] = filterFunc;
      }
    }
    // create and attach shadowRoot
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
      this.attachShadow({mode: 'open'});
    }

    // create thread
    this.thread = new Thread;

    // initialize ViewModel（call viewModel's $connectedCallback）
    await this.viewModel[Symbols.connectedCallback]();

    // buid binding tree and dom 
    this.rootBinding = BindingManager.create(this, template);
    this.rootBinding.registerBindingsToSummary();
    this.rootBinding.applyToNode();
    this.bindingSummary.flush();

    if (!this.useWebComponent) {
      // case of no useWebComponent, 
      // then insert fragment block before pseudo node nextSibling
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling);
      // child nodes add pseudoComponentByNode
      this.rootBinding.nodes.forEach(node => pseudoComponentByNode.set(node, this));
    } else {
      // case of useWebComponent,
      // then append fragment block to viewRootElement
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    // update slot wakeup
    if (this.updateSlot.isEmpty) {
      this.updateSlot.waitPromises.resolve(true);
    }
    // wait for update slot
    await this.updateSlot.alivePromises.promise;
  },

  /**
   * callback on adding this component to DOM tree
   * @returns {void}
   */
  async connectedCallback() {
//    console.log(`components[${this.tagName}].connectedCallback`);
    try {
      // wait for parent component initialize
      if (this.parentComponent) {
        await this.parentComponent.initialPromises.promise;
      } else {
      }

      if (!this.useWebComponent) {
        // case of no useWebComponent
        const comment = document.createComment(`@@/${this.tagName}`);
        this._pseudoParentNode = this.parentNode;
        this._pseudoNode = comment;
        this.pseudoParentNode.replaceChild(comment, this);
      }

      // promises for alive
      this.alivePromises = Promise.withResolvers();

      await this.build();
      
    } finally {
      this.initialPromises?.resolve && this.initialPromises.resolve();
    }
  },

  /**
   * callback on deleting this component from DOM tree
   * @returns {void}
   */
  disconnectedCallback() {
    this.alivePromises?.resolve && this.alivePromises.resolve(this.props[Symbols.toObject]());
  },

  /**
   * update binding nodes
   * called from update slot's node updator
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  updateNode(propertyAccessByViewModelPropertyKey) {
    this.rootBinding && BindingManager.updateNode(this.rootBinding, propertyAccessByViewModelPropertyKey);
  },

  /**
   * dialog popup
   * @param {Object<string,any>} props 
   * @param {boolean} modal 
   * @returns 
   */
  async popup(props, modal = true) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInComponent: popup is only for HTMLDialogElement");
    }
    this.returnValue = "";
    const promises = Promise.withResolvers();
    const closedEvent = new CustomEvent("closed");
    this.addEventListener("closed", () => {
      if (this.returnValue === "") {
        promises.reject();
      } else {
        promises.resolve(this.props[Symbols.toObject]());
      }
    });
    this.addEventListener("close", () => {
      this.dispatchEvent(closedEvent);
    });
    this.props = props;
    if (modal) {
      this.showModal();
    } else {
      this.show();
    }
    return promises.promise;
  },
};

const mixInDialog = {
  /** @type {boolean} */
  get mixInDialogInitialized() {
    return this._mixInDialogInitialized ?? false;
  },
  set mixInDialogInitialized(value) {
    this._mixInDialogInitialized = value;
  },
  /** @type {Promise<unknown>} */
  get mixInDialogPromises() {
    return this._mixInDialogPromises;
  },
  set mixInDialogPromises(value) {
    this._mixInDialogPromises = value;
  },
  /**
   * 
   */
  mixInDialogInit() {
    this.mixInDialogInitialized = true;
    this.addEventListener("closed", () => {
      if (typeof this.mixInDialogPromises !== "undefined") {
        if (this.returnValue === "") {
          this.mixInDialogPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.mixInDialogPromises.resolve(buffer);
        }
        this.mixInDialogPromises = undefined;
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        if (this.returnValue !== "") {
          this.props[Symbols.flushBuffer]();
        }
      }
    });
    this.addEventListener("close", () => {
      const closedEvent = new CustomEvent("closed");
      this.dispatchEvent(closedEvent);
    });
  },
  /**
   * 
   * @param {Object<string,any} props 
   * @param {boolean} modal 
   * @returns 
   */
  async _show(props, modal = true) {
    this.returnValue = "";
    this.mixInDialogPromises = Promise.withResolvers();
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    this.props[Symbols.setBuffer](props);
    if (modal) {
      HTMLDialogElement.prototype.showModal.apply(this);
    } else {
      HTMLDialogElement.prototype.show.apply(this);
    }
    return this.mixInDialogPromises.promise;
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowModal(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShowModal is only for HTMLDialogElement");
    }
    return this._show(props, true);
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShow(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShow is only for HTMLDialogElement");
    }
    return this._show(props, false);
  },
  showModal() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: showModal is only for HTMLDialogElement");
    }
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    const returnValue = HTMLDialogElement.prototype.showModal.apply(this);
    return returnValue;
  },
  show() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: show is only for HTMLDialogElement");
    }
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    const returnValue = HTMLDialogElement.prototype.show.apply(this);
    return returnValue;
  },
  close(returnValueByClose) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: close is only for HTMLDialogElement");
    }
    const returnValue = HTMLDialogElement.prototype.close.apply(this, [returnValueByClose]);
    return returnValue;
  },

};

/**
 * generate unique comonent class
 * for customElements.define
 */
class ComponentClassGenerator {
  
  /**
   * generate unique component class
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
        static useShadowRoot = module.useShadowRoot ?? config.useShadowRoot;

        /** @type {boolean} */
        static useWebComponent = module.useWebComponent ?? config.useWebComponent;

        /** @type {boolean} */
        static useLocalTagName = module.useLocalTagName ?? config.useLocalTagName;

        /** @type {boolean} */
        static useKeyed = module.useKeyed ?? config.useKeyed;

        /** @type {boolean} */
        static useBufferedBind = module.useBufferedBind ?? config.useBufferedBind;

        /** @type {boolean} */
        static get [Symbols.isComponent] () {
          return true;
        }

        /**
         */
        constructor() {
          super();
          const options = {};
          const setOptionFromAttribute = (name, flagName, options) => {
            if (this.hasAttribute(name)) {
              options[flagName] = true;
            } else if (this.hasAttribute("no-" + name)) {
              options[flagName] = false;
            } else {
              options[flagName] = this.constructor[flagName];
            }
          };
          setOptionFromAttribute("shadow-root", "useShadowRoot", options);
          setOptionFromAttribute("web-component", "useWebComponent", options);
          setOptionFromAttribute("local-tag-name", "useLocalTagName", options);
          setOptionFromAttribute("keyed", "useKeyed", options);
          setOptionFromAttribute("buffered-bind", "useBufferedBind", options);

          this.initialize(options);
        }
      };
    };
  
    /** @type {Module} */
    const module = Object.assign(new Module, componentModule);

    // generate new class, for customElements not define same class
    const componentClass = getBaseClass(module);
    if (typeof module.extendTag === "undefined") ; else {
      // case of customized built-in element
      // change class extends to extends constructor
      // See http://var.blog.jp/archives/75174484.html
      /** @type {HTMLElement.constructor} */
      const extendClass = document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // mix in component
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInDialog))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }

    // register component's subcomponents 
    registerComponentModules(module.componentModulesForRegist);

    return componentClass;
  }
}

/**
 * function for generate unique component class
 * @param {UserComponentModule} componentModule 
 * @returns {Component.constructor}
 */
function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {UserComponentModule} componentModule 
 */
function registerComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = ComponentClassGenerator.generate(componentModule);
  if (typeof componentModule.extendTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
  }
}

/**
 * 
 * @param {Object<string,UserComponentModule>} componentModules 
 */
function registerComponentModules(componentModules) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules ?? {})) {
    registerComponentModule(customElementName, userComponentModule);
  }
}

class Registrar {
  /**
   * 
   * @param {string} name 
   * @param {any} module 
   * @static
   */
  static register(name, module) {

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
      this.#registrar.register(loadName, moduleData);
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

const PREFIX = "filter-";

class QuelModuleRegistrar extends Registrar {
  /**
   * 
   * @param {string} name 
   * @param {Object<string,any>} module 
   * @returns {void}
   */
  static register(name, module) {
    if (name.startsWith(PREFIX)) {
      const filterName = name.slice(PREFIX.length);
      const { output, input } = module;
      Filter.register(filterName, output, input);
    } else {
      registerComponentModule(name, module);
    }
  }
}

const loader = Loader.create(QuelModuleRegistrar);

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
function registerFilters(filters) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output } = filterData;
    Filter.register(name, output, input);
  });
}

/**
 * 
 * @param {Object<string,any>} data 
 */
function registerGlobal(data) {
  Object.assign(GlobalData.data, data);
}

export { config, generateComponentClass, loader, registerComponentModules, registerFilters, registerGlobal };
