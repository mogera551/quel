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
    const propertyName = this.#propertyNameByName[name];
    if (typeof propertyName !== "undefined") return propertyName;
    return this.#propertyNameByName[name] = new PropertyName(name);
  }
  /**
   * @type {Object<string,PropertyName>}
   */
  static #propertyNameByName = {};
  static get propertyNameByName() {
    return this.#propertyNameByName;
  }

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

/** @type {(handler:class,target:object,receiver:Proxy<object>)=>(prop:string,indexes:number[])=>any} */
const directlyGetFunc = (handler, target, receiver) => (prop, indexes) => 
  Reflect.apply(handler.directlyGet, handler, [target, { prop, indexes }, receiver]);
/** @type {(handler:class,target:object,receiver:Proxy<object>)=>(prop:string,indexes:number[],value:any)=>boolean} */
const directlySetFunc = (handler, target, receiver) => (prop, indexes, value) =>
  Reflect.apply(handler.directlySet, handler, [target, { prop, indexes, value }, receiver]);
/** @type {(handler:class,target:object,receiver:Proxy<object>)=>boolean} */
const isSupportDotNotation = (handler, target, receiver) => true;

/** @type {Object<key:symbol,(handler:class,target:object,receiver:Proxy<object>)=>any>} */
const funcBySymbol = {
  [Symbols$1.directlyGet]: directlyGetFunc,
  [Symbols$1.directlySet]: directlySetFunc,
  [Symbols$1.isSupportDotNotation]: isSupportDotNotation,
};

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

  /** @type {string} */
  #lastIndexesString;
  get lastIndexesString() {
    if (typeof this.#lastIndexesString === "undefined") {
      this.#lastIndexesString = this.lastIndexes?.join(",");
    }
    return this.#lastIndexesString;
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
    const value = Reflect.get(target, propName.name, receiver);
    if (typeof value !== "undefined") return value;
    if (propName.parentPath === "") return undefined;
    const parent = this.getByPropertyName(target, { propName:PropertyName.create(propName.parentPath) }, receiver);
    if (typeof parent === "undefined") return undefined;
    const lastName = (propName.lastPathName === WILDCARD) ? this.lastIndexes[propName.level - 1] : propName.lastPathName;
    return parent[lastName];
  }

  /**
   * 
   * @param {any} target 
   * @param {{propName:PropertyName,value:any}}  
   * @param {Proxy} receiver
   * @returns {boolean}
   */
  setByPropertyName(target, { propName, value }, receiver) {
    if (Reflect.has(target, propName.name) || propName.isPrimitive) {
      return Reflect.set(target, propName.name, value, receiver);
    } else {
      const parent = this.getByPropertyName(target, { propName:PropertyName.create(propName.parentPath) }, receiver);
      if (typeof parent === "undefined") return false;
      const lastName = (propName.lastPathName === WILDCARD) ? this.lastIndexes[propName.level - 1] : propName.lastPathName;
      parent[lastName] = value;
      return true;
    }
  }

  /**
   * 
   * @param {number[]} indexes 
   * @param {()=>{}} callback 
   * @returns 
   */
  #pushIndexes(indexes, callback) {
    this.#lastIndexesString = undefined;
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
  #getFunc = (target, receiver) => ({propName, indexes}) => 
    this.#pushIndexes(indexes, () => this.getByPropertyName(target, { propName }, receiver));

  /**
   * 
   * @param {any} target 
   * @param {Proxy} receiver 
   * @returns {({}:PropertyAccess, value:any) => {boolean}  }
   */
  #setFunc = (target, receiver) => ({propName, indexes}, value) => 
    this.#pushIndexes(indexes, () => this.setByPropertyName(target, { propName, value }, receiver));

  /**
   * 
   * @param {any} target
   * @param {{propName:PropertyName,indexes:number[]}} 
   * @param {Proxy} receiver
   * @returns {any[]}
   */
  #getExpandLastLevel(target, { propName, indexes }, receiver) {
    const getFunc = this.#getFunc(target, receiver);
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
  #setExpandLastLevel(target, { propName, indexes, values }, receiver) {
    const getFunc = this.#getFunc(target, receiver);
    const setFunc = this.#setFunc(target, receiver);
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
    return this.#pushIndexes(indexes, () => this.getByPropertyName(target, { propName }, receiver));
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
    return this.#pushIndexes(indexes, () => this.setByPropertyName(target, { propName, value }, receiver));
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
    const func = funcBySymbol[prop];
    if (typeof func !== "undefined") {
      return func(this, target, receiver);
    }
    const getFunc = this.#getFunc(target, receiver);
    const lastIndexes = this.lastIndexes;
    let match;
    if (isPropString) {
      if (prop[0] === "$"  && (match = RE_CONTEXT_INDEX.exec(prop))) {
        // $数字のプロパティ
        // indexesへのアクセス
        return lastIndexes?.[Number(match[1]) - 1] ?? undefined;
      //} else if (prop.at(0) === "@" && prop.at(1) === "@") {
      } else if (prop[0] === "@") {
        const name = prop.slice(1);
        const propName = PropertyName.create(name);
        if (((lastIndexes?.length ?? 0) + 1) < propName.level) throw new Error(`array level not match`);
        const baseIndexes = lastIndexes?.slice(0, propName.level - 1) ?? [];
        return this.#getExpandLastLevel(target, { propName, indexes:baseIndexes }, receiver);
      }
      const propAccess = this.#matchByName.get(prop);
      if (typeof propAccess !== "undefined") {
        return getFunc(this.#matchByName.get(prop));
      } else {
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
      const setFunc = this.#setFunc(target, receiver);
      const lastIndexes = this.lastIndexes;
      if (prop.at(0) === "@") {
        const name = prop.slice(1);
        const propName = PropertyName.create(name);
        if (((this.lastIndexes?.length ?? 0) + 1) < propName.level) throw new Error(`array level not match`);
        const baseIndexes = this.lastIndexes?.slice(0, propName.level - 1) ?? [];
        return this.#setExpandLastLevel(target, { propName, indexes:baseIndexes, values:value }, receiver);
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
  updatedCallback: Symbol.for(`${name}:viewModel.updatedCallback`),

  connectedEvent: Symbol.for(`${name}:viewModel.connectedEvent`),
  disconnectedEvent: Symbol.for(`${name}:viewModel.disconnectedEvent`),
  updatedEvent: Symbol.for(`${name}:viewModel.updatedEvent`),

  getDependentProps: Symbol.for(`${name}:viewModel.getDependentProps`),
  clearCache: Symbol.for(`${name}:viewModel.clearCache`),
  directlyCall: Symbol.for(`${name}:viewModel.directCall`),
  notifyForDependentProps: Symbol.for(`${name}:viewModel.notifyForDependentProps`),
  createBuffer: Symbol.for(`${name}:viewModel.createBuffer`),
  flushBuffer: Symbol.for(`${name}:viewModel.flushBuffer`),

  boundByComponent: Symbol.for(`${name}:globalData.boundByComponent`),

  bindTo: Symbol.for(`${name}:componentModule.bindTo`),

  bindProperty: Symbol.for(`${name}:props.bindProperty`),
  setBuffer: Symbol.for(`${name}:props.setBuffer`),
  getBuffer: Symbol.for(`${name}:props.getBuffer`),
  clearBuffer: Symbol.for(`${name}:props.clearBuffer`),
  createBuffer: Symbol.for(`${name}:props.createBuffer`),
  flushBuffer: Symbol.for(`${name}:props.flushBuffer`),
  clear: Symbol.for(`${name}:props.clear`),
  toObject: Symbol.for(`${name}:props.toObject`),
  propInitialize: Symbol.for(`${name}:props.initialize`),

  isComponent: Symbol.for(`${name}:component.isComponent`),

  nullSafe: Symbol.for(`${name}:filter.nullSafe`),
  noNullSafe: Symbol.for(`${name}:filter.noNullSafe`),
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
  useLocalSelector: true, // use local selector
  useOverscrollBehavior: true, // use overscroll-behavior
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

const DATASET_BIND_PROPERTY$1 = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

/** @type {Map<string,HTMLTemplateElement>} */
const templateByUUID = new Map;

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
function replaceTag(html, componentUuid, customComponentNames) {
  /** @type {string[]} */
  const stack = [];
  /** @type {string} */
  const replacedHtml =  html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
    expr = expr.trim();
    if (expr.startsWith("loop:") || expr.startsWith("if:")) {
      stack.push(expr);
      return `<template data-bind="${expr}">`;
    } else if (expr.startsWith("else:")){
      const saveExpr = stack.at(-1);
      if (typeof saveExpr === "undefined" || !saveExpr.startsWith("if:")) {
        utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
      }
      return `</template><template data-bind="${saveExpr}|not">`;
    } else if (expr.startsWith("end:")){
      if (typeof stack.pop() === "undefined") {
        utils.raise(`Template: end: is not matched with loop: or if:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else if (expr.startsWith("endif:")){
      const expr = stack.pop();
      if (typeof expr === "undefined" || !expr.startsWith("if:")) {
        utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else if (expr.startsWith("endloop:")){
      const expr = stack.pop();
      if (typeof expr === "undefined" || !expr.startsWith("loop:")) {
        utils.raise(`Template: endloop: is not matched with loop:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else {
      return `<!--@@:${expr}-->`;
    }
  });
  if (stack.length > 0) {
    utils.raise(`Template: loop: or if: is not matched with endloop: or endif:, but {{ ${stack.at(-1)} }} `);
  }
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
        newTemplate.setAttribute(DATASET_BIND_PROPERTY$1, template.getAttribute(DATASET_BIND_PROPERTY$1));
        template = newTemplate;
      }
      template.setAttribute(DATASET_UUID_PROPERTY, uuid);
      replaceTemplate(template.content);
      templateByUUID.set(uuid, template);
    }
  };
  replaceTemplate(root.content);

  return root.innerHTML;
}

/**
 * UUIDからHTMLTemplateElementオブジェクトを取得(ループや分岐条件のブロック)
 * @param {string} uuid 
 * @returns {HTMLTemplateElement}
 */
function getByUUID(uuid) {
  return templateByUUID.get(uuid);
}

/**
 * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
 * @param {string|undefined} html 
 * @param {string} componentUuid
 * @param {string[]} customComponentNames
 * @returns {HTMLTemplateElement}
 */
function create$1(html, componentUuid, customComponentNames) {
  const template = document.createElement("template");
  template.innerHTML = html ? replaceTag(html, componentUuid, customComponentNames) : "";
  template.setAttribute(DATASET_UUID_PROPERTY, componentUuid);
  templateByUUID.set(componentUuid, template);
  return template;
}

/** @type {Map<string,CSSStyleSheet>} */
const styleSheetByUuid = new Map;

/**
 * create style sheet by css text
 * @param {string} cssText 
 * @returns {CSSStyleSheet}
 */
function createStyleSheet$1(cssText) {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

/**
 * get style sheet by uuid, if not found, create style sheet
 * @param {string} cssText 
 * @param {string} uuid 
 * @returns {CSSStyleSheet|undefined}
 */
function create(cssText, uuid) {
  const styleSheetFromMap = styleSheetByUuid.get(uuid);
  if (styleSheetFromMap) return styleSheetFromMap;
  const styleSheet = createStyleSheet$1(cssText);
  styleSheetByUuid.set(uuid, styleSheet);
  return styleSheet;
}

/**
 * 
 * @param {CSSStyleSheet} styleSheet 
 * @param {string} localSelector 
 * @returns 
 */
function localizeStyleSheet(styleSheet, localSelector) {
  for(let rule of styleSheet.cssRules) {
    if (rule instanceof CSSStyleRule) {
      const newSelectorText = rule.selectorText.split(",").map(selector => {
        if (selector.trim().startsWith(":host")) {
          return selector.replace(":host", localSelector);
        }
        return `${localSelector} ${selector}`;
      }).join(",");
      rule.selectorText = newSelectorText;
    }
  }
  return styleSheet;
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
    const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return create$1(this.html, this.uuid, customComponentNames);
  }

  /** @type {CSSStyleSheet|undefined} */
  get styleSheet() {
    return this.css ? create(this.css, this.uuid) : undefined;
  }

  /** @type {ViewModel.constructor} */
  ViewModel = undefined;

  /** @type {ViewModel.constructor} */
  State = undefined;

  /** @type {ComponentModuleConfig} */
  config = {};

  /** @type {ComponentModuleConfig} */
  moduleConfig = {};

  /** @type {ComponentModuleOptions} */
  options = {};

  /** @type {ComponentModuleFilters} */
  filters = {};

  /** @type {Object<string,Module>|undefined} */
  componentModules;

  /** @type {Object<string,Module>|undefined} */
  get componentModulesForRegister() {
    if (this.config.useLocalTagName ?? config.useLocalTagName) {
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

/**
 * @param {Component} component
 * @returns {number[]|undefined}
 */
const getPopoverContextIndexes = (component) => {
  const id = component.id;
  return component.parentComponent?.popoverContextIndexesById?.get(id);
};


/**
 * 
 * @param {Handler} handler 
 * @param {{name:string,indexes:number[]}} props 
 * @returns {number[]}
 */
const contextLoopIndexes = (handler, props) => {
  let indexes;
  const propName = new PropertyName(props.name);
  if (propName.level > 0 && props.indexes.length === 0 && handler.component.hasAttribute("popover")) {
    indexes = getPopoverContextIndexes(handler.component)?.slice(0 , propName.level);
  }
  return indexes ?? props.indexes;
};

let Handler$2 = class Handler {
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

  get binds() {
    return this.#binds;
  }

  #saveBindProperties = {};

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
     * @param {import("../binding/nodeProperty/ComponentProperty.js").BindingPropertyAccess} props 
     * @returns {()=>any}
     */
    const getFunc = (handler, name, props) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else {
        const match = RE_CONTEXT_INDEX.exec(props.name);
        if (match) {
          const loopIndex = Number(match[1]) - 1;
          let indexes = props.loopContext.indexes;
          if (indexes.length === 0 && handler.component.hasAttribute("popover")) {
            indexes = getPopoverContextIndexes(handler.component) ?? [];
          }
          return indexes[loopIndex];
        } else {
          const loopIndexes = contextLoopIndexes(handler, props);
          return handler.component.parentComponent.readOnlyViewModel[Symbols.directlyGet](props.name, loopIndexes);
        }
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
        const loopIndexes = contextLoopIndexes(handler, props);
        handler.component.parentComponent.writableViewModel[Symbols.directlySet](props.name, loopIndexes, value);
      }
      return true;
    };
    // save
    this.#saveBindProperties[prop] = Object.getOwnPropertyDescriptor(this.#component.baseViewModel, prop) ?? {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    };

    // define component's property
    Object.defineProperty(this.#component.baseViewModel, prop, {
      get: getFunc(this, prop, propAccess),
      set: setFunc(this, prop, propAccess),
      configurable: true,
      enumerable: true,
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
    let buffer;
    buffer = this.#component.parentComponent.readOnlyViewModel[Symbols.createBuffer](this.#component);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      const loopIndexes = contextLoopIndexes(this, propAccess);
      buffer[prop] = this.#component.parentComponent.readOnlyViewModel[Symbols.directlyGet](propAccess.name, loopIndexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const result = this.#component.parentComponent.writableViewModel[Symbols.flushBuffer](this.#buffer, this.#component);
      if (result !== true) {
        this.#binds.forEach(({ prop, propAccess }) => {
          const loopIndexes = contextLoopIndexes(this, propAccess);
          this.#component.parentComponent.writableViewModel[Symbols.directlySet](propAccess.name, loopIndexes, this.#buffer[prop]);     
        });
      }
    }
  }

  #clear() {
    this.#buffer = undefined;
    this.#binds = [];
    for(const [key, desc] of Object.entries(this.#saveBindProperties)) {
      Object.defineProperty(this.#component.baseViewModel, key, desc);
    }
    this.#saveBindProperties = {};
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
    } else if (prop === Symbols.clear) {
      return () => this.#clear();
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

  /**
   * Proxy.ownKeys
   * @param {any} target
   * @param {Proxy<Handler>} receiver 
   * @returns {string[]}
   */
  ownKeys(target, receiver) {
    if (typeof this.buffer !== "undefined") {
      return Reflect.ownKeys(this.buffer);
    } else {
      return this.#binds.map(({ prop }) => prop);
    }
  }

  /**
   * Proxy.getOwnPropertyDescriptor
   * @param {any} target
   * @param {string} prop
   * @param {Proxy<Handler>} receiver
   * @returns {PropertyDescriptor}
   */
  getOwnPropertyDescriptor(target, prop, receiver) { // プロパティ毎に呼ばれます
    return {
      enumerable: true,
      configurable: true
      /* ...other flags, probable "value:..."" */
    };
  }
};

/**
 * 
 * @param {Component} component
 * @returns {Proxy<Handler>}
 */
function createProps(component) {
  return new Proxy({}, new Handler$2(component));
}

class GlobalDataHandler extends Handler$3 {
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
let Handler$1 = class Handler {
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
};

/**
 * 
 * @param {Component} component
 * @returns {Proxy<Handler>}
 */
function createGlobals(component) {
  return new Proxy({}, new Handler$1(component));
}

/** @type {Set<string>} shadow rootが可能なタグ名一覧 */
const setOfAttachableTags = new Set([
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
const isCustomTag = tagName => tagName.indexOf("-") !== -1;

/**
 * タグ名がshadow rootを持つことが可能か
 * @param {string} tagName 
 * @returns {boolean}
 */
function isAttachable(tagName) {
  return isCustomTag(tagName) || setOfAttachableTags.has(tagName);
}

/**
 * @type {Map<BindingManager,Map<string,number[]>>}
 */
const setContextIndexesByIdByBindingManager = new Map;

class Popover {

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @returns 
   */
  static initialize(bindingManager) {
    let buttons = this.buttonsByFragment.get(bindingManager.fragment);
    if (typeof buttons === "undefined") {
      buttons = Array.from(bindingManager.fragment.querySelectorAll("[popovertarget]"));
      this.buttonsByFragment.set(bindingManager.fragment, buttons);
    }
    if (buttons.length === 0) return;
    for(const button of buttons) {
      const id = button.getAttribute("popovertarget");
      let setContextIndexes = setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
      if (typeof setContextIndexes === "undefined") {
        setContextIndexes = () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
        setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ?? 
          setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
      }
      button.removeEventListener("click", setContextIndexes);
      button.addEventListener("click", setContextIndexes);
    }
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    setContextIndexesByIdByBindingManager.delete(bindingManager);
  }

  /** @type {Map<DocumentFragment,HTMLButtonElement[]>} */
  static buttonsByFragment = new Map;
}

/** @type {Object<string,import("./Binding.js").BindingManager[]>} */
const bindingManagersByUUID = {};

/**
 * @param {Component} component
 * @param {HTMLTemplateElement} template
 * @param {string} uuid
 * @param {Binding|undefined} parentBinding
 * @returns {BindingManager}
 */
const createBindingManager = (component, template, uuid, parentBinding) => {
  let bindingManager = bindingManagersByUUID[uuid]?.pop()?.assign(component, template, uuid, parentBinding);
  if (typeof bindingManager === "undefined") {
    bindingManager = new BindingManager(component, template, uuid, parentBinding);
    bindingManager.initialize();
  }
  Popover.initialize(bindingManager);
  return bindingManager;
};

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

  /** @type {LoopContext|undefined} */
  get nearestLoopContext() {
    return this.nearestBindingManager?.loopContext;
  }

  /** @type {number} */
  #revision;
  #index;
  get _index() {
    const revision = this.bindingManager.component.contextRevision;
    if (this.#revision !== revision) {
      this.#index = this.binding.children.indexOf(this.#bindingManager);
      this.#revision = revision;
    }
    return this.#index;
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
   * @returns {LoopContext|undefined}
   */
  find(name) {
    let loopContext = this;
    while(typeof loopContext !== "undefined") {
      if (loopContext.name === name) return loopContext;
      loopContext = loopContext.parentBindingManager.loopContext;
    }
  }
}

const NodeType = {
  HTMLElement: 1,
  SVGElement: 2,
  Text: 3,
  Template: 4,
};

/** @type {(node:Node)=>string} */
const nodeKey = node => node.constructor.name + "\t" + node.textContent?.[2] ?? "";

/** @type {Object<string,NodeType>} */
const nodeTypeByNodeKey = {};

/** @type {Object<NodeType,(node:Node)=>NodeType>} */
const getNodeTypeByNode = node =>
  node instanceof Comment && node.textContent?.[2] === ":" ? NodeType.Text : 
  node instanceof HTMLElement ? NodeType.HTMLElement :
  node instanceof Comment && node.textContent?.[2] === "|" ? NodeType.Template : 
  node instanceof SVGElement ? NodeType.SVGElement : NodeType.Unknown;

/**
 * get node type
 * @param {Node} node
 * @returns {NodeType}
 */
const getNodeType = (node) => nodeTypeByNodeKey[nodeKey(node)] ?? (nodeTypeByNodeKey[nodeKey(node)] = getNodeTypeByNode(node));

const DEFAULT_PROPERTY = "textContent";

const defaultPropertyByElementType = {
  "radio": "checked",
  "checkbox": "checked",
  "button": "onclick",
};

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {Node} node
 * @param {HTMLElement|undefined} element 
 * @returns {string}
 */
const getDefaultPropertyHTMLElement = (node, element = node) => 
  element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLButtonElement ? "onclick" : 
  element instanceof HTMLAnchorElement ? "onclick" : 
  element instanceof HTMLFormElement ? "onsubmit" : 
  element instanceof HTMLInputElement ? (defaultPropertyByElementType[element.type] ?? "value") :
  DEFAULT_PROPERTY;

/** @type {Object<string,string>} cache */
const defaultPropertyByKey = {};

/** @type {(node:Node)=>string} */
const undefinedProperty = node => undefined;
/** @type {(node:Node)=>string} */
const textContentProperty = node => DEFAULT_PROPERTY;

/** @type {Object<NodeType,(node:Node)=>string>} */
const getDefaultPropertyByNodeType = {
  [NodeType.HTMLElement]: getDefaultPropertyHTMLElement,
  [NodeType.SVGElement]:  undefinedProperty,
  [NodeType.Text]:        textContentProperty,
  [NodeType.Template]:    undefinedProperty,
};

/**
 * get html element's default property
 * @param {Node} node 
 * @param {NodeType} nodeTYpe
 * @returns {string}
 */
const getDefaultProperty = (node, nodeType) => {
  const key = node.constructor.name + "\t" + (node.type ?? ""); // type attribute
  return defaultPropertyByKey[key] ?? (defaultPropertyByKey[key] = getDefaultPropertyByNodeType[nodeType](node));
};

const BIND_DATASET$1 = "bind";

/** @typedef {(node:Node)=>string} BindTextFn */

/** @type {BindTextFn} get text to bind from data-bind attribute */
const getBindTextFromHTMLElement = node => node.dataset[BIND_DATASET$1] ?? "";
/** @type {BindTextFn} get text to bind from data-bind attribute */
const getBindTextFromSVGElement = node => node.dataset[BIND_DATASET$1] ?? "";
/** @type {BindTextFn} get text to bind from textContent property */
const getBindTextFromText = node => node.textContent.slice(3) ?? "";
/** @type {BindTextFn} get text to bind from template's data-bind attribute, looking up by textContent property */
const getBindTextFromTemplate = node => getByUUID(node.textContent.slice(3) ?? "")?.dataset[BIND_DATASET$1] ?? "";

/** @type {Object<NodeType,BindTextFn>} */
const getBindTextByNodeType = {
  [NodeType.HTMLElement]: getBindTextFromHTMLElement,
  [NodeType.SVGElement]:  getBindTextFromSVGElement,
  [NodeType.Text]:        getBindTextFromText,
  [NodeType.Template]:    getBindTextFromTemplate,
};

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {string}
 */
const getBindText = (node, nodeType) => getBindTextByNodeType[nodeType](node);

const SAMENAME = "@";
const DEFAULT = "$";


/**
 * trim
 * @param {string} s 
 * @returns {string}
 */
const trim$1 = s => s.trim();

/**
 * check length
 * @param {string} s 
 * @returns {string}
 */
const has = s => s.length > 0;

const re = new RegExp(/^#(.*)#$/);
const decode = s => {
  const m = re.exec(s);
  return m ? decodeURIComponent(m[1]) : s;
};

/**
 * parse filter part
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 * @param {string} text 
 * @returns {FilterInfo}
 */
const parseFilter = text => {
  const [name, ...options] = text.split(",").map(trim$1);
  return {name, options:options.map(decode)};
};

/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 * @param {string} text 
 * @returns {{viewModelProperty:string,filters:FilterInfo[]}}
 */
const parseViewModelProperty = text => {
  const [viewModelProperty, ...filterTexts] = text.split("|").map(trim$1);
  return {viewModelProperty, filters:filterTexts.map(parseFilter)};
};

/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 * @param {string} expr 
 * @param {string} defaultName 
 * @returns {BindTextInfo}
 */
const parseExpression = (expr, defaultName) => {
  const [nodeProperty, viewModelPropertyText] = [defaultName].concat(...expr.split(":").map(trim$1)).splice(-2);
  const { viewModelProperty, filters } = parseViewModelProperty(viewModelPropertyText);
  return { nodeProperty, viewModelProperty, filters };
};

/**
 * parse bind text and return BindTextInfo[]
 * @param {string} text data-bind属性値
 * @param {string|undefined} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {BindTextInfo[]}
 */
const parseBindText = (text, defaultName) => {
  return text.split(";").map(trim$1).filter(has).map(s => { 
    let { nodeProperty, viewModelProperty, filters } = parseExpression(s, DEFAULT);
    viewModelProperty = viewModelProperty === SAMENAME ? nodeProperty : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    typeof nodeProperty === "undefined" && utils.raise("parseBindText: default property undefined");
    return { nodeProperty, viewModelProperty, filters };
  });
};

/** @type {Object<string,BindTextInfo[]>} */
const bindTextsByKey = {};

/**
 * parse bind text and return BindTextInfo[], if hit cache return cache value
 * @param {string} text data-bind属性値
 * @param {string｜undefined} defaultName prop:を省略時に使用する、プロパティの名前
 * @returns {BindTextInfo[]}
 */
function parse(text, defaultName) {
  (typeof text === "undefined") && utils.raise("Parser: text is undefined");
  if (text.trim() === "") return [];
  /** @type {string} */
  const key = text + "\t" + defaultName;

  return bindTextsByKey[key] ?? (bindTextsByKey[key] = parseBindText(text, defaultName));
}

/**
 * ambigous name:
 * "entries", "forEach", "has", "keys", "values", "parse",
 * "toString", "toLocaleString", "valueOf", "at", "concat", 
 * "includes", "indexOf", "lastIndexOf", "slice"
 */


/**
 * @typedef {(value:any,callback:FilterFunc)=>any} DecorateFunc
 */
/**
 * @typedef {object} FilterGroup
 * @property {class} ObjectClass
 * @property {string} prefix
 * @property {Set<string>} prototypeFuncs
 * @property {Set<string>} staticFuncs
 * @property {DecorateFunc} decorateFunc
 */

/** @type {FilterGroup} */
const objectFilterGroup = {
  ObjectClass: Object,
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

/** @type {FilterGroup} */
const arrayFilterGroup = {
  ObjectClass: Array,
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

/** @type {FilterGroup} */
const numberFilterGroup = {
  ObjectClass: Number,
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

/** @type {FilterGroup} */
const stringFilterGroup = {
  ObjectClass: String,
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

/** @type {FilterGroup} */
const dateFilterGroup = {
  ObjectClass: Date,
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

/** @type {FilterGroup} */
const setFilterGroup = {
  ObjectClass: Set,
  prefix: "set",
  prefixShort: "",
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
  prefixShort: "",
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
  prefixShort: "",
  prototypeFuncs: new Set([]),
  staticFuncs: new Set([
    "parse", "stringify"
  ]),
};

/** @type {FilterGroup} */
const mathFilterGroup = {
  ObjectClass: Math,
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

/** @type {FilterGroup} */
const regExpFilterGroup = {
  ObjectClass: RegExp,
  prefix: "regexp",
  prefixShort: "",
  prototypeFuncs: new Set([
    "exec", "test", "toString"
  ]),
  staticFuncs: new Set([
  ]),
};

class DefaultFilters {
  static "truthy*"    = options => value => value ? true : false;
  static "falsey*"    = options => value => !value ? true : false;
  static "not*"       = this["falsey*"];
  static eq           = options => value => value == options[0]; // equality
  static ne           = options => value => value != options[0]; // inequality
  static lt           = options => value => Number(value) < Number(options[0]); // less than
  static le           = options => value => Number(value) <= Number(options[0]); // less than or equal
  static gt           = options => value => Number(value) > Number(options[0]); // greater than
  static ge           = options => value => Number(value) >= Number(options[0]); // greater than or equal
  static oi           = options => value => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
  static ci           = options => value => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
  static embed        = options => value => (options[0] ?? "").replaceAll("%s", value);
  static iftext       = options => value => value ? options[0] ?? null : options[1] ?? null;
  static "isnull*"    = options => value => (value == null) ? true : false;
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
  static "isnan*"     = options => value => isNaN(value);
  static nullsafe     = options => value => Symbols.nullSafe;
  static nonullsafe   = options => value => Symbols.noNullSafe;
}

/** @type {FilterGroup} */
const defaultFilterGroup = {
  ObjectClass: DefaultFilters,
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

/** @type {(callback:FilterFuncWithOption)=>FilterFuncWithOption} */
const nullthru = callback => options => value => value == null ? value : callback(options)(value);

/** @type {(value:any,filter:FilterFunc)=>any} */
const reduceApplyFilter = (value, filter) => filter(value);

const thru$2 = options => value => value;

class Filters {
  /**
   * 
   * @param {FilterInfo[]} filters 
   * @param {FilterManager} manager
   * @returns {FilterFunc[]}
   */
  static create(filters, manager) {
    const filterFuncs = [];
    for(let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      filterFuncs.push(manager.getFilterFunc(filter.name)(filter.options));
    }
    return filterFuncs;
  }
}

class FilterManager {
  /** @type {Set<string>} */
  ambigousNames;
  /** @type {Map<string, FilterFuncWithOption>} */
  funcByName;

  /**
   * register user defined filter, check duplicate name
   * @param {string} funcName 
   * @param {FilterFuncWithOption} filterFunc 
   */
  registerFilter(funcName, filterFunc) {
    const isNotNullThru = funcName.endsWith("*");
    const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;

    if (this.funcByName.has(realFuncName)) {
      utils.raise(`${this.constructor.name}: ${realFuncName} is already registered`);
    }
    const wrappedFunc = !isNotNullThru ? nullthru(filterFunc) : filterFunc;
    this.funcByName.set(realFuncName, wrappedFunc);
  }

  /**
   * get filter function by name
   * @param {string} name 
   * @returns {FilterFuncWithOption}
   */
  getFilterFunc(name) {
    this.ambigousNames.has(name) && utils.raise(`${this.constructor.name}: ${name} is ambigous`);
    return this.funcByName.get(name) ?? thru$2;
  }

  /**
   * 
   * @param {any} value 
   * @param {FilterFunc[]} filters 
   * @returns {any}
   */
  static applyFilter(value, filters) {
    return filters.reduce(reduceApplyFilter, value);
  }
}

class OutputFilterManager extends FilterManager {
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
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        const func = createPrototypeFilterFunc(group.ObjectClass, realFuncName);
        const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
        group.prefix && funcByName.set(`${group.prefix}.${realFuncName}`, wrappedFunc);
        group.prefixShort && funcByName.set(`${group.prefixShort}.${realFuncName}`, wrappedFunc);
        if (funcByName.has(realFuncName)) {
          ambigousNames.add(realFuncName);
        } else {
          funcByName.set(realFuncName, wrappedFunc);
        }
      }
      for(const funcName of group.staticFuncs) {
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        const func = createStaticFilterFunc(group.ObjectClass, realFuncName);
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
    for(const funcName of defaultFilterGroup.staticFuncs) {
      const isNotNullThru = funcName.endsWith("*");
      const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
      const func = DefaultFilters[funcName];
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
  /**
   * 
   * @param {string} funcName 
   * @param {FilterFuncWithOption} filterFunc 
   */
  static registerFilter(funcName, filterFunc) {
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
  static date         = options => value => value === "" ? null : new Date(new Date(value).setHours(0));
  static number       = options => value => value === "" ? null : Number(value);
  static boolean      = options => value => (value === "false" || value === "") ? false : true;
}

class InputFilterManager extends FilterManager {
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

class EventFilterManager extends FilterManager {
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

  /** @type {FilterFunc[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    this.assign(binding, node, name, filters);
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Node} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   * @returns {NodeProperty}
   */
  assign(binding, node, name, filters) {
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = Filters.create(filters.toReversed(), binding.component.filters.in);
    return this;
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

  dispose() {
  }
}

const PREFIX$3 = "@@|";

class TemplateProperty extends NodeProperty {
  /** @type {HTMLTemplateElement} */
  #template
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
    }
    return this.#template;
  }

  /** @type {string} */
  #uuid;
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = TemplateProperty.getUUID(this.node);
    }
    return this.#uuid
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Comment)) utils.raise("TemplateProperty: not Comment");
    super(binding, node, name, filters);
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
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`);
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.postCreate();
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
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
    if (typeof value !== "boolean") utils.raise(`Branch: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not boolean`, );
    if (this.value !== value) {
      if (value) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.postCreate();
      } else {
        const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
        removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
      }
    } else {
      this.binding.children.forEach(bindingManager => bindingManager.applyToNode());
    }
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters);
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
  value;

  /** @type {boolean} */
  enabled;

  /**
   * 
   * @param {any} value 
   * @param {boolean} enabled 
   */
  constructor(value, enabled) {
    this.value = value;
    this.enabled = enabled;
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
    const indexes = this.binding.loopContext?.indexes ?? [];
    return indexes.length === this.level ? indexes : indexes.slice(0 , this.level);
//    return this.binding.loopContext?.indexes.slice(0 , this.level) ?? [];
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
        setValue(value.enabled ? value.value : undefined);
      }
    } else {
      setValue(value);
    }
  }

  /** @type {FilterFunc[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, name, filters) {
    this.assign(binding, name, filters);
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   * @returns {ViewModelProperty}
   */
  assign(binding, name, filters) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = Filters.create(filters, binding.component.filters.out);
    this.#propertyName = PropertyName.create(this.name);
    this.#level = this.#propertyName.level;
    return this;
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

  dispose() {
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, name, filters) {
    if (!regexp$1.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
    super(binding, name, filters);
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
   * @param {FilteInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Element)) utils.raise("ElementBase: not element");
    super(binding, node, name, filters);
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
    if (!Array.isArray(value)) utils.raise(`ElementClassName: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`, );
    this.element.className = value.join(" ");
  }
  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== NAME) utils.raise(`ElementClassName: invalid property name ${name}`);
    super(binding, node, name, filters);
  }
}

class Checkbox extends ElementBase {
  /** @type {HTMLInputElement} */
  get inputElement() {
    return this.node;
  }

  /** @type {MultiValue} */
  _value = new MultiValue(undefined, false);
  get value() {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }

  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise(`Checkbox: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`, );
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = value.some(v => v === multiValue.value);
  }

  /** @type {MultiValue} */
  _filteredValue = new MultiValue(undefined, false);
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if (node.type !== "checkbox") utils.raise("Checkbox: not checkbox");
    super(binding, node, name, filters);
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
  _value = new MultiValue(undefined, false);
  get value() {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }
  /** @param {any} value */
  set value(value) {
    /** @type {MultiValue} */
    const multiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  /** @type {MultiValue} */
  _filteredValue = new MultiValue(undefined, false);
  get filteredValue() {
    /** @type {MultiValue} */
    const multiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }
  
  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Radio: not htmlInputElement");
    if (node.type !== "radio" && node.type !== "checkbox") utils.raise("Radio: not radio or checkbox");
    super(binding, node, name, filters);
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

  /** @type {EventFilterFunc[]} */
  #eventFilters = [];
  get eventFilters() {
    return this.#eventFilters;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!name.startsWith(PREFIX$2)) utils.raise(`ElementEvent: invalid property name ${name}`);
    super(binding, node, name, filters);
    this.#eventFilters = Filters.create(filters, binding.component.filters.event);
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
    // 再構築などでバインドが削除されている場合は処理しない
    if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false)) return;
    const { viewModelProperty = undefined, loopContext = undefined } = this.binding ?? {};
    return viewModelProperty?.viewModel[Symbols.directlyCall](viewModelProperty.name, loopContext, event);
  }

  /**
   * 
   * @param {Event} event
   */
  eventHandler(event) {
    // 再構築などでバインドが削除されている場合は処理しない
    if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false)) return;
    // event filter
    event = this.eventFilters.length > 0 ? FilterManager.applyFilter(event, this.eventFilters) : event;
    !(event?.noStopPropagation ?? false) && event.stopPropagation();
    this.binding.component.updator.addProcess(this.directlyCall, this, [event]);
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
    if (typeof value !== "boolean") utils.raise(`ElementClass: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not boolean`, );
    value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!name.startsWith(PREFIX$1)) utils.raise(`ElementClass: invalid property name ${name}`);
    super(binding, node, name, filters);
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof HTMLElement)) utils.raise("ElementStyle: not htmlElement");
    super(binding, node, name, filters);
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
  /** @type {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} */
  #viewModelProperty;

  /** @type {string} */
  get name() {
    return this.#viewModelProperty.name;
  }

  /** @type {number[]} */
  get indexes() {
    return this.#viewModelProperty.indexes;
  }

  /** @type {import("../../loopContext/LoopContext.js").LoopContext} */
  get loopContext() {
    return this.#viewModelProperty.binding.loopContext;
  }
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
    return true;
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
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node.constructor[Symbols.isComponent])) utils.raise("ComponentProperty: not Component");
    super(binding, node, name, filters);
  }

  get value() {
    return super.value;
  }
  set value(value) {
//    console.log(`componentProperty: props.${this.propName} = ${value}`);
//    if (typeof this.thisComponent.viewModel === "undefined") {
//      console.log("this.thisComponent.viewModel is undefined.");
//    }
    this.thisComponent.viewModel?.[Symbols.updatedCallback]([[`${this.propName}`, []]]); 
    this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](this.propName, []);
  }
  /**
   * 初期化処理
   * コンポーネントプロパティのバインドを行う
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
//        console.log(`componentProperty:postUpdate(${propName}${remain})`);
        this.thisComponent.viewModel?.[Symbols.updatedCallback]([[`${propName}${remain}`, propertyAccess.indexes]]);
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

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);

/**
 * Exclude from GC
 */

class RepeatKeyed extends Repeat {
  /** @type {Map<any,number>} */
  #fromIndexByValue = new Map; // 複数同じ値がある場合を考慮

  /** @type {Set<number>} */
  #lastIndexes = new Set;

  /** @type {Set<number>} */
  #setOfNewIndexes = new Set;

  /** @type {Map<number,BindingManager>} */
  #lastChildByNewIndex = new Map;

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
    if (!Array.isArray(values)) utils.raise(`RepeatKeyed: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`);
    this.#fromIndexByValue.clear();
    this.#lastIndexes.clear();
    this.#setOfNewIndexes.clear();
    this.#lastChildByNewIndex.clear();
    for(let newIndex = 0; newIndex < values.length; newIndex++) {
      // values[newIndex]では、get "values.*"()を正しく取得できない
      const value = this.binding.viewModelProperty.getChildValue(newIndex);
      const lastIndex = this.#lastValue.indexOf(value, this.#fromIndexByValue.get(value) ?? 0);
      if (lastIndex === -1 || lastIndex === false) {
        // 元のインデックスにない場合（新規）
        this.#setOfNewIndexes.add(newIndex);
      } else {
        // 元のインデックスがある場合（既存）
        this.#fromIndexByValue.set(value, lastIndex + 1); // 
        this.#lastIndexes.add(lastIndex);
        this.#lastChildByNewIndex.set(newIndex, this.binding.children[lastIndex]);
      }
    }
    for(let i = 0; i < this.binding.children.length; i++) {
      if (this.#lastIndexes.has(i)) continue;
      this.binding.children[i].dispose();
    }

    /** @type {BindingManager[]} */
    this.binding.children.slice(0);
    /** @type {BindingManager[]} */
    let beforeBindingManager;
    /** @type {Node} */
    const parentNode = this.node.parentNode;
    for(let i = 0; i < values.length; i++) {
      const newIndex = i;
      /** @type {BindingManager} */
      let bindingManager;
      const beforeNode = beforeBindingManager?.lastNode ?? this.node;
      if (this.#setOfNewIndexes.has(newIndex)) {
        // 元のインデックスにない場合（新規）
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
        parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        bindingManager.postCreate();
      } else {
        // 元のインデックスがある場合（既存）
        bindingManager = this.#lastChildByNewIndex.get(newIndex);
        if (bindingManager.nodes?.[0]?.previousSibling !== beforeNode) {
          bindingManager.removeNodes();
          parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
        }
        (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
        bindingManager.applyToNode();
      }
      beforeBindingManager = bindingManager;
    }
    if (values.length < this.binding.children.length) {
      this.binding.children.length = values.length;
    }
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
      const oldValue = this.#lastValue[index];
      const typeofOldValue = typeof oldValue;
      if (typeofOldValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofOldValue)) continue;
      bindingManager.removeNodes();
      bindingManagerByValue.set(oldValue, bindingManager);
    }
    for(const index of Array.from(setOfIndex).sort()) {
      const newValue = this.binding.viewModelProperty.getChildValue(index);
      const typeofNewValue = typeof newValue;
      if (typeofNewValue === "undefined") continue;
      if (setOfPrimitiveType.has(typeofNewValue)) continue;
      let bindingManager = bindingManagerByValue.get(newValue);
      if (typeof bindingManager === "undefined") {
        bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.replaceChild(index, bindingManager);
        bindingManager.postCreate();
      } else {
        this.binding.replaceChild(index, bindingManager);
        bindingManager.applyToNode();
      }
    }
    this.#lastValue = this.binding.viewModelProperty.value.slice();
  }

  initialize() {
    this.#lastValue = [];
  }

  dispose() {
    super.dispose();
    this.#lastValue = [];
  }
}

const regexp = RegExp(/^\$[0-9]+$/);

/** @type {Object<boolean,Object<string,typeof NodeProperty>>} */
const nodePropertyConstructorByNameByIsComment = {
  true: {
    "if": Branch,
  },
  false: {
    "class": ElementClassName,
    "checkbox": Checkbox,
    "radio": Radio,
  }
};

/** @type {Object<string,typeof NodeProperty>} */
const nodePropertyConstructorByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
  "props": ComponentProperty,
};

/**
 * get constructors for NodeProperty and ViewModelProperty
 * @param {Node} node 
 * @param {string} nodePropertyName 
 * @param {string} viewModelPropertyName 
 * @param {boolean} useKeyed
 * @returns {{ nodePropertyConstructor: typeof NodeProperty, viewModelPropertyConstructor: typeof ViewModelProperty }}
 */
const getConstructors = (node, nodePropertyName, viewModelPropertyName, useKeyed) => {
  /** @type {ViewModelProperty.constructor} */
  const viewModelPropertyConstructor = regexp.test(viewModelPropertyName) ? ContextIndex : ViewModelProperty;
  /** @type {NodeProperty.constructor} */
  let nodePropertyConstructor;
  do {
    const isComment = node instanceof Comment;
    nodePropertyConstructor = nodePropertyConstructorByNameByIsComment[isComment][nodePropertyName];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (isComment && nodePropertyName === "loop") {
      nodePropertyConstructor = useKeyed ? RepeatKeyed : Repeat;
      break;
    }
    if (isComment) utils.raise(`Factory: unknown node property ${nodePropertyName}`);
    const nameElements = nodePropertyName.split(".");
    nodePropertyConstructor = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (node instanceof Element) {
      if (nodePropertyName.startsWith("on")) {
        nodePropertyConstructor = ElementEvent;
      } else {
        nodePropertyConstructor = ElementProperty;
      }
    } else {
      nodePropertyConstructor = NodeProperty;
    }
  } while(false);
  return { nodePropertyConstructor, viewModelPropertyConstructor };
};

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const replaceTextNodeText = (node) => {
  const textNode = document.createTextNode("");
  node.parentNode.replaceChild(textNode, node);
  return textNode;
};

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const itsSelf = node => node;

/** @type {Object<NodeType,(node:Node)=>Node>} */
const replaceTextNodeFn = {
  [NodeType.Text]:        replaceTextNodeText,
  [NodeType.HTMLElement]: itsSelf,
  [NodeType.SVGElement]:  itsSelf,
  [NodeType.Template]:    itsSelf,
};

/**
 * replace comment node to text node
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {Node}
 */
const replaceTextNode = (node, nodeType) => replaceTextNodeFn[nodeType](node);

/**
 * get indexes of childNodes from root node to the node 
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param {Node} node 
 * @returns {number[]}
 */
const computeNodeRoute = node => {
  /** @type {number[]} */
  let routeIndexes = [];
  while(node.parentNode !== null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node), ...routeIndexes ];
    node = node.parentNode;
  }
  return routeIndexes;
};

//const routeFn = (node, routeIndex) => node.childNodes[routeIndex];
//export const findNodeByNodeRoute = (rootNode, nodeRoute) => nodeRoute.reduce(routeFn, rootNode);
/**
 * find node by node route
 * @param {Node} node 
 * @param {NodeRoute} nodeRoute 
 * @returns {Node}
 */
const findNodeByNodeRoute = (node, nodeRoute) => {
  for(let i = 0 ; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};

/** 
 * @type {(bindTextInfo:BindTextInfo)=>(bindingManager:BindingManager,node:Node)=>Binding} 
 * create binding from bindTextInfo, bindingManager and node
 */
const createBinding = (bindTextInfo) => (bindingManager, node) => Binding.create(
  bindingManager,
  node, bindTextInfo.nodeProperty, bindTextInfo.nodePropertyConstructor, 
  bindTextInfo.viewModelProperty, bindTextInfo.viewModelPropertyConstructor, 
  bindTextInfo.filters
);

const DATASET_BIND_PROPERTY = 'data-bind';

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const removeAttributeFromElement = (node) => {
  /** @type {Element} */
  const element = node;
  element.removeAttribute(DATASET_BIND_PROPERTY);
  return element;
};

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const thru$1 = (node) => node;

/** @type {Object<NodeType,(node:Node)=>Node>} */
const removeAttributeByNodeType = {
  [NodeType.HTMLElement]: removeAttributeFromElement,
  [NodeType.SVGElement]:  removeAttributeFromElement,
  [NodeType.Text]:        thru$1,
  [NodeType.Template]:    thru$1,
};

/**
 * remove data-bind attribute from node
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {Node}
 */
const removeAttribute = (node, nodeType) => removeAttributeByNodeType[nodeType](node);

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableHTMLElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));

/** @type {(node:Node)=>boolean} */
const alwaysFalse = node => false;

/** @type {Object<NodeType,(node:Node)=>boolean>} */
const isInputableFn = {
  [NodeType.HTMLElement]: isInputableHTMLElement,
  [NodeType.SVGElement]:  alwaysFalse,
  [NodeType.Text]:        alwaysFalse,
  [NodeType.Template]:    alwaysFalse,
};

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {boolean}
 */
const isInputable = (node, nodeType) => isInputableFn[nodeType](node);

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";

/** @type {Set<(event:Event)=>void>} */
const defaultEventHandlers = new Set;

/** @type {(element:HTMLElement)=>(binding:import("../binding/Binding.js").Binding)=>void} */
const setDefaultEventHandlerByElement = element => binding => 
  element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);

/**
 * 
 * @param {Node} node
 * @param {boolean} isInputable
 * @param {Binding[]} bindings 
 * @param {string} defaultName
 * @returns {void}
 */
function InitializeHTMLElement(node, isInputable, bindings, defaultName) {
  /** @type {HTMLElement}  */
  const element = node;

  // set event handler
  /** @type {boolean} has default event */
  let hasDefaultEvent = false;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let defaultBinding = null;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let radioBinding = null;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let checkboxBinding = null;

  for(let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
    radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
    checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
    defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
  }

  if (!hasDefaultEvent) {
    /** @type {(binding:import("../binding/Binding.js").Binding)=>void} */
    const setDefaultEventHandler = setDefaultEventHandlerByElement(element);

    if (radioBinding) {
      setDefaultEventHandler(radioBinding);
      defaultEventHandlers.add(radioBinding.defaultEventHandler);
    } else if (checkboxBinding) {
      setDefaultEventHandler(checkboxBinding);
      defaultEventHandlers.add(checkboxBinding.defaultEventHandler);
    } else if (defaultBinding && isInputable) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
      defaultEventHandlers.add(defaultBinding.defaultEventHandler);
    }
  }
  return undefined;
}

/** @type {()=>void} */
const thru = () => {};

/** @type {{[key:NodeType]:(node:Node, isInputable:boolean, bindings:Binding[], defaultName:string)=>void}} */
const InitializeNodeByNodeType = {
  [NodeType.HTMLElement]: InitializeHTMLElement,
  [NodeType.SVGElement]:  thru,
  [NodeType.Text]:        thru,
  [NodeType.Template]:    thru,
};

/**
 * Initialize node created from template.importNode
 * @type {(nodeInfo:BindNodeInfo)=>(node:Node, bindings:Binding[])=>void}
 */
const InitializeNode = (nodeInfo) => (node, bindings) => InitializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.isInputable, bindings, nodeInfo.defaultProperty);

/**
 * is the node a comment node for template or text ?
 * @param {Node} node 
 * @returns {boolean}
 */
const isCommentNode = node => node instanceof Comment && (node.textContent.startsWith("@@:") || node.textContent.startsWith("@@|"));

/**
 * get comment nodes for template or text
 * @param {Node} node 
 * @returns {Comment[]}
 */
const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : []));

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;
const UUID_DATASET = "uuid";

class Binder {
  /** @type {HTMLTemplateElement} */
  template;
  /** @type {string} */
  uuid;

  /** @type {BindNodeInfo[]} */
  nodeInfos = [];

  /**
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {boolean} useKeyed
   */
  constructor(template, uuid, useKeyed) {
    this.template = template;
    this.uuid = uuid;
    this.parse(useKeyed);
  }

  /**
   * 
   * @param {boolean} useKeyed 
   */
  parse(useKeyed, { template, nodeInfos } = this) {
    const rootElement = template.content;
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));
    nodeInfos.length = 0;
    for(let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      /** @type {BindNodeInfo} */
      const nodeInfo = { };
      nodeInfo.nodeType = getNodeType(node);
      if (typeof nodeInfo.nodeType === "undefined") utils.raise(`Binder: unknown node type`);
      const bindText = getBindText(node, nodeInfo.nodeType);
      if (bindText.trim() === "") continue;
      node = replaceTextNode(node, nodeInfo.nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意

      removeAttribute(node, nodeInfo.nodeType);
      nodeInfo.isInputable = isInputable(node, nodeInfo.nodeType);
      nodeInfo.defaultProperty = getDefaultProperty(node, nodeInfo.nodeType);
      /** @type {BindTextInfo[]} */
      nodeInfo.bindTextInfos = parse(bindText, nodeInfo.defaultProperty);
      for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
        const bindTextInfo = nodeInfo.bindTextInfos[j];
        const { nodeProperty, viewModelProperty } = bindTextInfo;
        bindTextInfo.createBinding = createBinding(bindTextInfo);
        const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, nodeProperty, viewModelProperty, useKeyed);
        bindTextInfo.nodePropertyConstructor = nodePropertyConstructor;
        bindTextInfo.viewModelPropertyConstructor = viewModelPropertyConstructor;
      }
      nodeInfo.nodeRoute = computeNodeRoute(node);
      nodeInfo.nodeRouteKey = nodeInfo.nodeRoute.join(",");
      nodeInfo.initializeNode = InitializeNode(nodeInfo);

      nodeInfos[nodeInfos.length] = nodeInfo; // push
    }
  }

  /**
   * 
   * @param {DocumentFragment} content
   * @param {BindingManager} bindingManager
   * @returns {Binding[]}
   */
  createBindings(content, bindingManager, { nodeInfos } = this) {
    const bindings =[];
    for(let i = 0; i < nodeInfos.length; i++) {
      const nodeInfo = nodeInfos[i];
      const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
      const nodeBindings = [];
      for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
        nodeBindings[nodeBindings.length] = 
          nodeInfo.bindTextInfos[j].createBinding(bindingManager, node); // push
      }
      nodeInfo.initializeNode(node, nodeBindings);
      bindings.push(...nodeBindings);
    }
    return bindings;
  }

  /** @type {Object<string,Binder>} */
  static binderByUUID = {};
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {boolean} useKeyed
   * @returns {Binder}
   */
  static create(template, useKeyed, { binderByUUID } = this) {
    const uuid = template.dataset[UUID_DATASET] ?? "";
    return binderByUUID[uuid] ?? (binderByUUID[uuid] = new Binder(template, uuid, useKeyed));
  }
}

let seq = 0;

class Binding {
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
  #isSelectValue;
  get isSelectValue() {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.nodeProperty.isSelectValue;
    }
    return this.#isSelectValue;
  }

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
   * @param {FilterInfo[]} filters
   */
  constructor(bindingManager,
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor,
    filters
  ) {
    this.assign(bindingManager, node, nodePropertyName, nodePropertyConstructor, viewModelPropertyName, viewModelPropertyConstructor, filters);
  }

  /**
   * for reuse
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
   * @param {FilterInfo[]} filters
   * @returns {Binding}
   */
  assign(bindingManager, 
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor, filters) {
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = Reflect.construct(nodePropertyConstructor, [this, node, nodePropertyName, filters]);
    this.#viewModelProperty = Reflect.construct(viewModelPropertyConstructor, [this, viewModelPropertyName, filters]);
    return this;
  }

  /**
   * apply value to node
   */
  applyToNode({ component, nodeProperty, viewModelProperty } = this) {
    component.updator.applyNodeUpdatesByBinding(this, updator => {
      if (!nodeProperty.applicable) return;
      const filteredViewModelValue = viewModelProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredViewModelValue)) return;
      nodeProperty.value = filteredViewModelValue;
    });
  }

  /**
   * apply value to child nodes
   * @param {Set<number>} setOfIndex 
   */
  applyToChildNodes(setOfIndex, { component } = this) {
    component.updator.applyNodeUpdatesByBinding(this, updator => {
      this.nodeProperty.applyToChildNodes(setOfIndex);
    });
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
    if (!(this.component?.bindingSummary.exists(this) ?? false)) return;
    event.stopPropagation();
    this.component.updator.addProcess(this.applyToViewModel, this, []);
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

  dispose() {
    for(let i = 0; i < this.children.length; i++) {
      this.children[i].dispose();
    }
    this.children.length = 0;
    this.nodeProperty.dispose();
    this.viewModelProperty.dispose();
    this.component.bindingSummary.delete(this);
  }

  /**
   * create Binding
   * @param {BindingManager} bindingManager 
   * @param {Node} node
   * @param {string} nodePropertyName
   * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor 
   * @param {string} viewModelPropertyName
   * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor
   * @param {FilterInfo[]} filters
   */
  static create(bindingManager,
    node, nodePropertyName, nodePropertyConstructor, 
    viewModelPropertyName, viewModelPropertyConstructor,
    filters
  ) {
    const binding = Reflect.construct(Binding, [bindingManager,
        node, nodePropertyName, nodePropertyConstructor, 
        viewModelPropertyName, viewModelPropertyConstructor,
        filters]);
    binding.initialize();
    return binding;
  }
}

/** @type {(node:Node)=>boolean} */
const filterElement = node => node.nodeType === Node.ELEMENT_NODE;

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

  /** @type {Element[]} */
  get elements() {
    return this.#nodes.filter(filterElement);
  }

  /** @type {Node} */
  get lastNode() {
    return this.#nodes[this.#nodes.length - 1];
  }

  /** @type {DocumentFragment} */
  #fragment;
  get fragment() {
    return this.#fragment;
  }
  set fragment(value) {
    this.#fragment = value;
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

  /** @type {BindingSummary} */
  #bindingSummary;

  /** @type {string} */
  #uuid;
  get uuid() {
    return this.#uuid;
  }

  /**
   * 
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {Binding|undefined} parentBinding
   */
  constructor(component, template, uuid, parentBinding) {
    this.assign(component, template, uuid, parentBinding);
  }

  /**
   * for reuse
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @param {string} uuid 
   * @param {Binding|undefined} parentBinding 
   * @returns {BindingManager}
   */
  assign(component, template, uuid, parentBinding) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
    this.#bindingSummary = component.bindingSummary;
    this.#uuid = uuid;

    return this;
  }

  /**
   * 
   */
  initialize() {
    const binder = Binder.create(this.#template, this.#component.useKeyed);
    this.#fragment = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#bindings = binder.createBindings(this.#fragment, this);
    this.#nodes = Array.from(this.#fragment.childNodes);
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#bindingSummary.add(this.#bindings[i]);
    }
  }

  postCreate() {
    this.registerBindingsToSummary();
    this.applyToNode();
  }

  /**
   * apply value to node
   */
  applyToNode() {
    // apply value to node exluding select tag, and apply select tag value
    const selectBindings = [];
    for(let i = 0; i < this.#bindings.length; i++) {
      const binding = this.#bindings[i];
      if (binding.isSelectValue) {
        selectBindings.push(binding);
      } else {
        binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
  }

  /**
   * apply value to ViewModel
   */
  applyToViewModel() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#bindings[i].applyToViewModel();
    }
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    for(let i = 0; i < this.#nodes.length; i++) {
      this.#fragment.appendChild(this.#nodes[i]);
    }
  }

  /**
   * 
   */
  dispose() {
    this.removeNodes(); // append nodes to fragment
    for(let i = 0; i < this.bindings.length; i++) {
      this.bindings[i].dispose();
    }
    const uuid = this.#uuid;
    this.#parentBinding = undefined;
    this.#component = undefined;
    this.#bindingSummary = undefined;

    bindingManagersByUUID[uuid]?.push(this) ??
      (bindingManagersByUUID[uuid] = [this]);
  }

  /**
   * create BindingManager
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {Binding|undefined} parentBinding
   * @returns {BindingManager}
   */
  static create(component, template, uuid, parentBinding) {
    return createBindingManager(component, template, uuid, parentBinding);
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

const CONNECTED_EVENT = "connected";
const DISCONNECTED_EVENT = "disconnected";
const UPDATED_EVENT = "updated";

/** @type {(...args)=>void} */
const createConnectedDetail = (...args) => {};
/** @type {(...args)=>void} */
const createDisconnectedDetail = (...args) => {};
/** @type {(...args)=>void} */
const createUpdatedDetail = (...args) => ({props:args});

/** @type {Object<Symbol,(...args)=>void>} */
const createDetailFn = {
  [Symbols.connectedEvent]: createConnectedDetail,
  [Symbols.disconnectedEvent]: createDisconnectedDetail,
  [Symbols.updatedEvent]: createUpdatedDetail,
};

/** @type {Object<Symbol,string>} */
const customEventNames = {
  [Symbols.connectedEvent]: CONNECTED_EVENT,
  [Symbols.disconnectedEvent]: DISCONNECTED_EVENT,
  [Symbols.updatedEvent]: UPDATED_EVENT,
};

/**
 * 
 * @param {Component} component 
 * @param {Symbol} symbol 
 * @param {any[]} args 
 */
const dispatchCustomEvent = (component, symbol, args) => {
  const event = new CustomEvent(customEventNames[symbol], {
    detail: createDetailFn[symbol](...args),
  });
  component.dispatchEvent(event);
};

class ViewModelHandlerBase extends Handler$3 {
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
    this.#component.updator?.addProcess(target, thisArg, argumentArray);
  }

  /**
   * 更新情報をキューイングする
   * @param {ViewModel} target 
   * @param {PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  addNotify(target, propertyAccess, receiver) {
    this.#component.updator?.addUpdatedStateProperty(Object.assign({}, propertyAccess));
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
      const getValuesFn = viewModel[Symbols.directlyGet];
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
        if (isTerminate) {
          if (element === "*") {
            const indexes = [];
            const len = getValuesFn(parentName, loopIndexes).length;
            for(let i = 0; i < len; i++) {
              indexes.push(loopIndexes.concat(i));
            }
            return indexes;
          } else {
            return [ loopIndexes ];
          }
        } else {
          const currentName = parentNameDot + element;
          if (element === "*") {
            if (loopIndexes.length < indexes.length) {
              return traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
            } else {
              const indexes = [];
              const len = getValuesFn(parentName, loopIndexes).length;
              for(let i = 0; i < len; i++) {
                indexes.push(...traverse(currentName, elementIndex + 1, loopIndexes.concat(i)));
              }
              return indexes;
            }
          } else {
            return traverse(currentName, elementIndex + 1, loopIndexes);
          }
        }
      };
      const listOfIndexes = traverse("", 0, []);
      return listOfIndexes;
    }
  }
}

const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";
const UPDATED_CALLBACK = "$updatedCallback";

/**
 * @type {Object<symbol,string>}
 */
const callbackNameBySymbol = {
  [Symbols.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols.updatedCallback]: UPDATED_CALLBACK,
};

/**
 * @type {Set<symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols.connectedCallback,
  Symbols.disconnectedCallback,
  Symbols.updatedCallback,
]);

/** @type {{callback:Symbol,event:Symbol}} */
const callbackToEvent = {
  [Symbols.connectedCallback]: Symbols.connectedEvent,
  [Symbols.disconnectedCallback]: Symbols.disconnectedEvent,
  [Symbols.updatedCallback]: Symbols.updatedEvent,
};

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
    const applyCallback = (...args) => async () => {
      (callbackName in viewModel) && Reflect.apply(viewModel[callbackName], viewModelProxy, args);
      dispatchCustomEvent(handler.component, callbackToEvent[prop], args);
    };
    return (prop === Symbols.connectedCallback) ?
      (...args) => applyCallback(...args)() : 
      (...args) => handler.addProcess(applyCallback(...args), viewModelProxy, []);
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

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

/**
 * 外部から呼び出されるViewModelのAPI
 * @type {Set<symbol>}
 */
const setOfApiFunctions = new Set([
  Symbols.directlyCall,
  Symbols.getDependentProps,
  Symbols.notifyForDependentProps,
  Symbols.clearCache,
  Symbols.createBuffer,
  Symbols.flushBuffer,
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
  [Symbols.createBuffer]:({viewModelProxy}) => (component) => viewModelProxy[CREATE_BUFFER_METHOD]?.apply(viewModelProxy, [component]),
  [Symbols.flushBuffer]:({viewModelProxy}) => (buffer, component) => viewModelProxy[FLUSH_BUFFER_METHOD]?.apply(viewModelProxy, [buffer, component]),
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

const bindValue = (target) => (value) => (typeof value === "function") ? value.bind(target) : value;

class Handler {
  /**
   * Proxy.get
   * @param {Component} target
   * @param {string} prop
   * @param {Proxy<Handler>} receiver
   * @returns {any|undefined}
   */
  get(target, prop, receiver) {
    const accessibleProperties = new Set(target.accessibleProperties);
    const allProperties = new Set(target.allProperties);
    if (allProperties.has(prop)) {
      if (accessibleProperties.has(prop)) {
        return bindValue(target)(target[prop]);
      }
    } else {
      // mixedInしたプロパティでない場合、そのままアクセスOK
      return bindValue(target)(target[prop]);
    }
  }
}

const createUserComponent = (component) => new Proxy(component, new Handler);

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
  [COMPONENT_PROPERTY]: ({component}) => createUserComponent(component),
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
   * @param {string} indexesString 
   * @returns {any}
   */
  get(propName, indexesString) {
    return this.#valueByIndexesStringByPropertyName.get(propName)?.get(indexesString) ?? undefined;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {string} indexesString 
   * @returns {boolean}
   */
  has(propName, indexesString) {
    return this.#valueByIndexesStringByPropertyName.get(propName)?.has(indexesString) ?? false;
  }

  /**
   * 
   * @param {PropertyName} propName 
   * @param {string} indexesString 
   * @param {any} value
   * @returns {any}
   */
  set(propName, indexesString, value) {
    this.#valueByIndexesStringByPropertyName.get(propName)?.set(indexesString, value) ?? 
      this.#valueByIndexesStringByPropertyName.set(propName, new Map([[indexesString, value]]));
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
        const indexesString = propName.level > 0 ? (
          propName.level === this.lastIndexes.length ? 
            this.lastIndexesString :
            this.lastIndexes.slice(0, propName.level).join(",")
        ) : "";
        const cachedValue = this.#cache.get(propName, indexesString);
        if (typeof cachedValue !== "undefined") return cachedValue;
        if (this.#cache.has(propName, indexesString)) return undefined;
        const value = super.getByPropertyName(target, { propName }, receiver);
        this.#cache.set(propName, indexesString, value);
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

/**
 * オブジェクトのすべてのプロパティのデスクリプタを取得する
 * 継承元を遡る、ただし、Objectのプロパティは取得しない
 * @param {ViewModel} target 
 * @returns {Map<string,PropertyDescriptor>}
 */
function getDescByName(target) {
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
function getMethods(descByNameEntries, targetClass) {
  return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value === "function")
}

/**
 * オブジェクト内のプロパティを取得する
 * @param {[string,PropertyDescriptor][]} descByNameEntries 
 * @returns {[string,PropertyDescriptor][]}
 */
function getProperties(descByNameEntries, targetClass) {
  return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value !== "function")
}

/** @type {Map<typeof ViewModel,ViewModelInfo>} */
const viewModelInfoByConstructor = new Map;

/**
 * ViewModel化
 * ・非プリミティブかつ初期値のないプロパティは削除する
 * @param {ViewModel} target 
 * @returns {{
 *   definedProps:string[],
 *   primitiveProps:string[],
 *   methods:string[],
 *   accessorProps:string[],
 *   viewModel:ViewModel
 * }}
 */
function viewModelize(target) {
  let viewModelInfo = viewModelInfoByConstructor.get(target.constructor);
  if (!viewModelInfo) {
    const descByName = getDescByName(target);
    const descByNameEntries = Array.from(descByName.entries());
    const removeProps = [];
    const definedProps = [];
    const primitiveProps = [];
    const accessorProps = [];
    const methods = getMethods(descByNameEntries, target.constructor).map(([name, desc]) => name);
    getProperties(descByNameEntries, target.constructor).forEach(([name, desc]) => {
      definedProps.push(name);
      const propName = PropertyName.create(name);
      if (propName.isPrimitive) {
        primitiveProps.push(name);
      } else {
        if (("value" in desc) && typeof desc.value === "undefined") {
          removeProps.push(name);
        }
      }
      if ("get" in desc && typeof desc.get !== "undefined") {
        accessorProps.push(name);
      }
    });
    viewModelInfo = { removeProps, definedProps, primitiveProps, methods, accessorProps };
    viewModelInfoByConstructor.set(target.constructor, viewModelInfo);
  }
  viewModelInfo.removeProps.forEach(propertyKey => Reflect.deleteProperty(target, propertyKey));
  return {
    definedProps:viewModelInfo.definedProps, 
    primitiveProps:viewModelInfo.primitiveProps,
    methods:viewModelInfo.methods, 
    accessorProps:viewModelInfo.accessorProps,
    viewModel:target
  };
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
  #findLoopContext(prop) {
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
      const loopContext = this.#findLoopContext(prop);
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
    const loopContext = this.#findLoopContext(prop);
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
  const { viewModel, accessorProps } = viewModelize(Reflect.construct(viewModelClass, []));
  const setOfAccessorProperties = new Set(accessorProps);
  const dependentProps = new DependentProps();
  dependentProps.setDependentProps(viewModel[DEPENDENT_PROPS_PROPERTY] ?? {});
  return {
    "readonly": new Proxy(viewModel, new ReadOnlyViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "writable": new Proxy(viewModel, new WritableViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "base": viewModel,
  };
}

/** @type {(binding: Binding) => string} */
const pickKey = (binding) => binding.viewModelProperty.key;

/** @type {(binding: Binding) => boolean} */
const filterExpandableBindings = (binding) => binding.nodeProperty.expandable;

/** @type {(binding: Binding) => boolean} */
const filerComponentBindings = (binding) => binding.nodeProperty.constructor === ComponentProperty;

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

  #updating = false;

  /** @type {number} */
  #updateRevision = 0;
  get updateRevision() {
    return this.#updateRevision;
  }

  /** @type {Map<string,Binding[]>} viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す */
  #bindingsByKey = new Map; // Object<string,Binding[]>：16ms、Map<string,Binding[]>：9.2ms
  get bindingsByKey() {
    if (this.#updating) utils.raise("BindingSummary.bindingsByKey can only be called after BindingSummary.update()");
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} if/loopを持つbinding */
  #expandableBindings = new Set;
  get expandableBindings() {
    if (this.#updating) utils.raise("BindingSummary.expandableBindings can only be called after BindingSummary.update()");
    return this.#expandableBindings;
  }

  /** @type {Set<Binding} componentを持つbinding */
  #componentBindings = new Set;
  get componentBindings() {
    if (this.#updating) utils.raise("BindingSummary.componentBindings can only be called after BindingSummary.update()");
    return this.#componentBindings;
  }

  /** @type {Set<Binding>} 全binding */
  #allBindings = new Set;
  get allBindings() {
    return this.#allBindings;
  }

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    if (!this.#updating) utils.raise("BindingSummary.add() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.add(binding);
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    if (!this.#updating) utils.raise("BindingSummary.delete() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.delete(binding);
  }

  exists(binding) {
    return this.#allBindings.has(binding);
  }
  /**
   * 
   */
  flush() {
    config.debug && performance.mark('BindingSummary.flush:start');
    try {
      this.rebuild(this.#allBindings);
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
   * @param {(summary:BindingSummary)=>any} callback 
   */
  update(callback) {
    this.#updating = true;
    this.#updated = false;
    this.#updateRevision++;
    try {
      callback(this);
    } finally {
      if (this.#updated) this.flush();
      this.#updating = false;
    }
  }

  /**
   * 
   * @param {Set<Binding>} bindings 
   */
  rebuild(bindings) {
    this.#allBindings = bindings;
    const arrayBindings = Array.from(bindings);
    this.#bindingsByKey = Map.groupBy(arrayBindings, pickKey);
    this.#expandableBindings = new Set(arrayBindings.filter(filterExpandableBindings));
    this.#componentBindings = new Set(arrayBindings.filter(filerComponentBindings));
  }
}

const ADOPTED_VAR_NAME = '--adopted-css';

/** @type {Map<string,CSSStyleSheet>} */
const styleSheetByName = new Map;

/**
 * copy style rules to adopted style sheet
 * @param {CSSStyleSheet} fromStyleSheet 
 * @param {CSSStyleSheet} toStyleSheet 
 */
function copyStyleRules(fromStyleSheet, toStyleSheet) {
  Array.from(fromStyleSheet.cssRules).map(rule => {
    if (rule.constructor.name === "CSSImportRule") {
      copyStyleRules(rule.styleSheet, toStyleSheet);
    } else {
      toStyleSheet.insertRule(rule.cssText, toStyleSheet.cssRules.length);
    }
  });
}

/**
 * create adopted style sheet by name, and copy style rules from existing style sheet
 * @param {string} name 
 * @returns 
 */
function createStyleSheet(name) {
  const styleSheet = new CSSStyleSheet();
  const matchTitle = sheet => sheet.title === name;
  const fromStyleSheets = Array.from(document.styleSheets).filter(matchTitle);
  if (fromStyleSheets.length === 0) {
    // ToDo: warning
    return;
  }
  fromStyleSheets.forEach(fromStyleSheet => copyStyleRules(fromStyleSheet, styleSheet));
  styleSheetByName.set(name, styleSheet);
  return styleSheet;
}

/**
 * trim name
 * @param {string} name 
 * @returns {string}
 */
const trim = name => name.trim();

/**
 * exclude empty name
 * @param {string} name 
 * @returns {boolean}
 */
const excludeEmptyName = name => name.length > 0;

/**
 * 
 * @param {string} name 
 * @returns {CSSStyleSheet}
 */
const getStyleSheet = name => styleSheetByName.get(name) ?? createStyleSheet(name);

/**
 * exclude empty style sheet
 * @param {CSSStyleSheet} styleSheet 
 * @returns {CSSStyleSheet}
 */
const excludeEmptySheet = styleSheet => styleSheet;

/**
 * get adopted css list by names
 * @param {string[]} names 
 * @returns {CSSStyleSheet[]}
 */
function getStyleSheetList(names) {
    // find adopted style sheet from map, if not found, create adopted style sheet
    return names.map(getStyleSheet).filter(excludeEmptySheet);
}

/**
 * get name list from component style variable '--adopted-css'
 * @param {Component} component 
 * @returns {string[]}
 */
function getNamesFromComponent(component) {
  // get adopted css names from component style variable '--adopted-css'
  return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmptyName) ?? [];
}

/** @typedef {(prop:PropertyAccess)=>string} PropAccessKey */
/** @type {PropAccessKey} */
const getPropAccessKey = (prop) => prop.propName.name + "\t" + prop.indexes.toString();
/** @type {(process:Process)=>()=>Promise<void>} */
const executeProcess = (process) => async () => Reflect.apply(process.target, process.thisArgument, process.argumentList);
/** @type {(a:ViewModelProperty,b:ViewModelProperty)=>number} */
const compareExpandableBindings = (a, b) => a.viewModelProperty.propertyName.level - b.viewModelProperty.propertyName.level;

class Updator {
  /** @type {Component} */
  component;
  state;
  /** @type {Process[]} */
  processQueue = [];
  /** @type {PropertyAccess[]} */
  updatedStateProperties = [];
  /** @type {PropertyAccess[]} */ 
  expandedStateProperties = [];
  /** @type {Set<Binding>} */
  updatedBindings = new Set();

  executing = false;

  constructor(component) {
    this.component = component;
  }

  /**
   * 
   * @param {()=>any} target 
   * @param {object} thisArgument 
   * @param {any[]} argumentList 
   * @param {{ processQueue:Process[], executing:boolean, exec:()=>any }} param3 
   * @returns 
   */
  addProcess(target, thisArgument, argumentList, { processQueue, executing } = this) {
    processQueue.push({ target, thisArgument, argumentList });
    if (executing) return;
    this.exec();
  }

  /**
   * 
   * @param {{ processQueue:Process[] }} param0
   * @returns {Process[]}
   */
  getProcessQueue({ processQueue } = this) {
    return processQueue;
  }

  /**
   * 
   * @param {PropertyAccess} prop
   * @param {{ updatedStateProperties:PropertyAccess[] }} param1 
   */
  addUpdatedStateProperty(prop, { updatedStateProperties } = this) {
    updatedStateProperties.push(prop);
  }

  /**
   * 
   * @param {{ component:Component, processQueue:Process[], updatedStateProperties:PropertyAccess[] }} param0 
   * @returns {Promise<PropertyAccess[]>}
   */
  async process({ component, processQueue, updatedStateProperties } = this) {
    const totalUpdatedStateProperties = [];
    // event callback, and update state
    while (processQueue.length > 0) {
      const processes = processQueue.slice(0);
      processQueue.length = 0;
      for(let i = 0; i < processes.length; i++) {
        await component.writableViewModelCallback(executeProcess(processes[i]));
      }
      if (updatedStateProperties.length > 0) {
        // call updatedCallback, and add processQeueue
        component.writableViewModel[Symbols.updatedCallback](updatedStateProperties);
        totalUpdatedStateProperties.push(...updatedStateProperties);
        updatedStateProperties.length = 0;
      }
    }
    // cache clear
    component.readOnlyViewModel[Symbols.clearCache]();
    return totalUpdatedStateProperties;
  }

  /**
   * 
   * @param {PropertyAccess[]} updatedStateProperties 
   * @param {{ component:Component }} param1 
   */
  expandStateProperties(updatedStateProperties, { component } = this) {
    // expand state properties
    const expandedStateProperties = updatedStateProperties.slice(0);
    for(let i = 0; i < updatedStateProperties.length; i++) {
      expandedStateProperties.push(...ViewModelHandlerBase.makeNotifyForDependentProps(
        component.readOnlyViewModel, updatedStateProperties[i]
      ));
    }
    return expandedStateProperties;
  }

  /**
   * 
   * @param {Map<string,PropertyAccess>} expandedStatePropertyByKey 
   * @param {{ component:Component }} param1 
   */
  rebuildBinding(expandedStatePropertyByKey, { component } = this) {
    // bindingの再構築
    // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
    // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
    // 再構築する際、branch、repeatの子ノードは更新する
    // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
    const bindingSummary = component.bindingSummary;
    /** @type {Binding[]} */
    const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
    bindingSummary.update((bindingSummary) => {
      for(let i = 0; i < expandableBindings.length; i++) {
        const binding = expandableBindings[i];
        if (!bindingSummary.exists(binding)) continue;
        if (expandedStatePropertyByKey.has(binding.viewModelProperty.key)) {
          binding.applyToNode();
        }
      }
    });
  }

  /**
   * 
   * @param {PropertyAccess[]} expandedStateProperties 
   * @param {{ component:Component, updatedBindings:Set<binding> }} param1 
   */
  updateChildNodes(expandedStateProperties, { component } = this) {
    const bindingSummary = component.bindingSummary;
    /** @type {Map<string,Set<number>>} */
    const setOfIndexByParentKey = new Map;
    for(const propertyAccess of expandedStateProperties) {
      if (propertyAccess.propName.lastPathName !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.propName.parentPath + "\t" + propertyAccess.indexes.slice(0, -1);
      setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
    }
    for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
      for(const binding of bindingSummary.bindingsByKey.get(parentKey) ?? new Set) {
        binding.applyToChildNodes(setOfIndex);
      }
    }
  }

  /**
   * 
   * @param {Map<string,PropertyAccess>} expandedStatePropertyByKey 
   * @param {{ component:Component, updatedBindings:Set<binding> }} param1 
   */
  updateNode(expandedStatePropertyByKey, { component } = this) {
    const bindingSummary = component.bindingSummary;
    const selectBindings = [];
    for(const key of expandedStatePropertyByKey.keys()) {
      const bindings = bindingSummary.bindingsByKey.get(key);
      if (typeof bindings === "undefined") continue;
      for(let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        binding.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
    for(const binding of bindingSummary.componentBindings) {
      //if (updatedBindings.has(binding)) continue;
      binding.nodeProperty.postUpdate(expandedStatePropertyByKey);
    }
  }
  /**
   * 
   * @param {()=>any} callback 
   */
  async execCallback(callback) {
    this.executing = true;
    config.debug && performance.mark('Updator.exec:start');
    try {
      await callback();
    } finally {
      if (config.debug) {
        performance.mark('Updator.exec:end');
        performance.measure('Updator.exec', 'Updator.exec:start', 'Updator.exec:end');
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures('Updator.exec');
        performance.clearMarks('Updator.exec:start');
        performance.clearMarks('Updator.exec:end');
      }
      this.executing = false;
    }
  }

  /**
   * 
   * @param {{ updatedBindings:Set<Binding>, component:Component }} param0 
   */
  async exec({ updatedBindings, component } = this) {
    await this.execCallback(async () => {
      while(this.getProcessQueue().length > 0) {
        updatedBindings.clear();
        component.contextRevision++;

        const updatedStateProperties = await this.process();
        const expandedStateProperties = this.expandStateProperties(updatedStateProperties);

        const expandedStatePropertyByKey = 
          new Map(expandedStateProperties.map(prop => [getPropAccessKey(prop), prop]));

        this.rebuildBinding(expandedStatePropertyByKey);
        this.updateChildNodes(expandedStateProperties);
        this.updateNode(expandedStatePropertyByKey);
      }
    });
  }

  /**
   * 
   * @param {Binding} binding 
   * @param {(updator:Updator)=>any} callback 
   * @param {{ updatedBindings:Set<Binding> }} param2
   * @returns {void}
   */
  applyNodeUpdatesByBinding(binding, callback, { updatedBindings } = this) {
    if (updatedBindings.has(binding)) return;
    try {
      callback(this);
    } finally {
      updatedBindings.add(binding);
    }
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
class MixedComponent {
  /** @type {ViewModelProxy} view model proxy */
  get baseViewModel() {
    return this._viewModels["base"];
  }

  /** @type {ViewModelProxy} view model proxy */
  get writableViewModel() {
    return this._viewModels["writable"];
  }

  /** @type {ViewModelProxy} view model proxy */
  get readOnlyViewModel() {
    return this._viewModels["readonly"];
  }

  /** @type {boolean} */
  get isWritable() {
    return this._isWritable;
  }

  /** @type {ViewModelProxy} view model proxy */
  get viewModel() {
    if (this.cachableInBuilding) return this.readOnlyViewModel;
    return this.isWritable ? this.writableViewModel : this.readOnlyViewModel;
  }

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  }
  set rootBinding(value) {
    this._rootBinding = value;
  }

  /** @type {Object<string,any>} parent component property */
  get props() {
    return this._props;
  }
  set props(value) {
    this._props[Symbols.setBuffer](value);
  }

  /** @type {Object<string,any>} global object */
  get globals() {
    return this._globals;
  }

  /** @type {Promises} initial promises */
  get initialPromises() {
    return this._initialPromises;
  }

  /** @type {Promises} alive promises */
  get alivePromises() {
    return this._alivePromises;
  }
  set alivePromises(value) {
    this._alivePromises = value;
  }

  /** @type {Component} parent component */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  }

  /** @type {boolean} use shadowRoot */
  get useShadowRoot() {
    return this._useShadowRoot;
  }

  /** @type {boolean} use web component */
  get useWebComponent() {
    return this._useWebComponent;
  }

  /** @type {boolean} use local tag name */
  get useLocalTagName() {
    return this._useLocalTagName;
  }

  /** @type {boolean} use keyed */
  get useKeyed() {
    return this._useKeyed;
  }

  /** @type {boolean} use local selector */
  get useLocalSelector() {
    return this._useLocalSelector;
  }

  /** @type {boolean} use overscroll behavior */
  get useOverscrollBehavior() {
    return this._useOverscrollBehavior;
  }

  /** @type {boolean} use buffered bind */
  get useBufferedBind() {
    return this.hasAttribute("buffered-bind");
  }

  /** @type {ShadowRoot|HTMLElement} view root element */
  get viewRootElement() {
    return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode;
  }

  /** @type {ShadowRoot|HTMLElement} alias view root element */
  get queryRoot() {
    return this.viewRootElement;
  }

  /** @type {Node} parent node（use, case of useWebComponent is false） */
  get pseudoParentNode() {
    return !this.useWebComponent ? this._pseudoParentNode : utils.raise("mixInComponent: useWebComponent must be false");
  }

  /** @type {Node} pseudo node（use, case of useWebComponent is false） */
  get pseudoNode() {
    return this._pseudoNode;
  }

  /** @type {{in:InputFilterManager,out:OutputFilterManager,event:EventFilterManager}} filters */
  get filters() {
    return this._filters;
  }

  /** @type {BindingSummary} binding summary */
  get bindingSummary() {
    return this._bindingSummary;
  }

  /** @type {ShadowRoot|Document} find parent shadow root, or document, for adoptedCSS  */
  get shadowRootOrDocument() {
    let node = this.parentNode;
    while(node) {
      if (node instanceof ShadowRoot) {
        return node;
      }
      node = node.parentNode;
    }
    return document;
  }

  get contextRevision() {
    return this._contextRevision;
  }
  set contextRevision(value) {
    this._contextRevision = value;
  }

  get cachableInBuilding() {
    return this._cachableInBuilding;
  }
  set cachableInBuilding(value) {
    this._cachableInBuilding = value;
  }

  get updator() {
    return this._updator;
  }
  /** 
   * initialize
   * @returns {void}
   */
  initializeCallback() {
    /** @type {Component.constructor} */
    const componentClass = this.constructor;
    /**
     * set members
     */
    this._isWritable = false;
    this._viewModels = createViewModels(this, componentClass.ViewModel); // create view model
    this._rootBinding = undefined;
    this._props = createProps(this); // create property for parent component connection
    this._globals = createGlobals(); // create property for global connection
    this._initialPromises = undefined;
    this._alivePromises = undefined;

    this._parentComponent = undefined;

    this._useShadowRoot = componentClass.useShadowRoot;
    this._useWebComponent = componentClass.useWebComponent;
    this._useLocalTagName = componentClass.useLocalTagName;
    this._useKeyed = componentClass.useKeyed;
    this._useLocalSelector = componentClass.useLocalSelector;
    this._useOverscrollBehavior = componentClass.useOverscrollBehavior;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = undefined;

    this._bindingSummary = new BindingSummary;

    this._initialPromises = Promise.withResolvers(); // promises for initialize

    this._contextRevision = 0;

    this._cachableInBuilding = false;

    this._updator = new Updator(this);      
    //console.log("mixInComponent:initializeCallback");
  }

  /**
   * build component (called from connectedCallback)
   * setting filters
   * create and attach shadowRoot
   * initialize view model
   * @returns {Promise<any>}
   */
  async build() {
//    console.log(`components[${this.tagName}].build`);
    this.cachableInBuilding = false;
    /**
     * @type {{
     *   template:HTMLTemplateElement,
     *   styleSheet:CSSStyleSheet,
     *   inputFilterManager:InputFilterManager,
     *   outputFilterManager:OutputFilterManager,
     *   eventFilterManager:EventFilterManager
     * }} 
     */
    const { template, styleSheet, inputFilterManager, outputFilterManager, eventFilterManager } = this.constructor; // from static members of ComponentBase class 
    
    // setting filters
    this._filters = {
      in: inputFilterManager,
      out: outputFilterManager,
      event: eventFilterManager,
    };
    // create and attach shadowRoot
    // adopt css
    if (isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
      this.attachShadow({mode: 'open'});
      const names = getNamesFromComponent(this);
      const styleSheets = getStyleSheetList(names);
      if (typeof styleSheet !== "undefined" ) {
        styleSheets.push(styleSheet);
      }
      this.shadowRoot.adoptedStyleSheets = styleSheets;
    } else {
      if (typeof styleSheet !== "undefined") {
        let adoptedStyleSheet = styleSheet;
        if (this.useLocalSelector) {
          if (typeof this.constructor.localStyleSheet !== "undefined") {
            adoptedStyleSheet = this.constructor.localStyleSheet;
          } else {
            adoptedStyleSheet = this.constructor.localStyleSheet = localizeStyleSheet(styleSheet, this.selectorName);
          }
        }
        const shadowRootOrDocument = this.shadowRootOrDocument;
        const adoptedStyleSheets = Array.from(shadowRootOrDocument.adoptedStyleSheets);
        if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
          shadowRootOrDocument.adoptedStyleSheets = [...adoptedStyleSheets, adoptedStyleSheet];
        }
      }
    }
    if (this.useOverscrollBehavior) {
      if (this.tagName === "DIALOG" || this.hasAttribute("popover")) {
        this.style.overscrollBehavior = "contain";
      }
    }

    // initialize ViewModel（call viewModel's $connectedCallback）
    await this.viewModel[Symbols.connectedCallback]();

    this.cachableInBuilding = true;

    // build binding tree and dom 
    this.bindingSummary.update((summary) => {
      this.rootBinding = BindingManager.create(this, template, template.dataset["uuid"]);
      this.rootBinding.postCreate();
    });

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

    this.cachableInBuilding = false;
  }

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
  }

  /**
   * callback on deleting this component from DOM tree
   * @returns {void}
   */
  disconnectedCallback() {
    this.rootBinding?.dispose();
    this.props[Symbols.clear]();
    this.alivePromises?.resolve && this.alivePromises.resolve(this.props);
    this.initialize();
  }

  /**
   * 
   * @param {()=>void} func 
   * @param {object} thisArg 
   * @param {any[]} args 
   */
  addProcess(func, thisArg, args) {
    this.updator.addProcess(func, thisArg, args ?? []);
  }

  /**
   * use writable view model
   * @param {()=>void)} callback 
   */
  async writableViewModelCallback(callback) {
    this._isWritable = true;
    try {
      await callback();
    } finally {
      this._isWritable = false;
    }
  }

  get accessibleProperties() {
    return [ "addProcess", "viewRootElement ", "queryRoot" ];
  }
}

class MixedDialog {
  /** @type {Promise<unknown>} */
  get dialogPromises() {
    return this._dialogPromises;
  }
  set dialogPromises(value) {
    this._dialogPromises = value;
  }
  /** 
   * initialize
   * @returns {void}
   */
  initializeCallback() {
    this.addEventListener("closed", () => {
      if (typeof this.dialogPromises !== "undefined") {
        if (this.returnValue === "") {
          this.dialogPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.dialogPromises.resolve(buffer);
        }
        this.dialogPromises = undefined;
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
    //console.log("dialogMixIn:initializeCallback");
  }
  /**
   * 
   * @param {Object<string,any} props 
   * @param {boolean} modal 
   * @returns 
   */
  async _show(props, modal = true) {
    this.returnValue = "";
    this.dialogPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    if (modal) {
      HTMLDialogElement.prototype.showModal.apply(this);
    } else {
      HTMLDialogElement.prototype.show.apply(this);
    }
    return this.dialogPromises.promise;
  }
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
  }
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
  }
  /**
   * 
   * @returns 
   */
  showModal() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: showModal is only for HTMLDialogElement");
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    return HTMLDialogElement.prototype.showModal.apply(this);
  }
  /**
   * 
   * @returns 
   */
  show() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: show is only for HTMLDialogElement");
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    return HTMLDialogElement.prototype.show.apply(this);
  }
  /**
   * 
   * @param {string} returnValue 
   * @returns 
   */
  close(returnValue = "") {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: close is only for HTMLDialogElement");
    }
    return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
  }

  get accessibleProperties() {
    if (this.tagName === "DIALOG") {
      return ["showModal", "show", "close", "asyncShowModal", "asyncShow"];
    }
  }
}

class MixedPopover {
  /** @type {boolean} */
  get canceled() {
    return this._canceled ?? false;
  }
  set canceled(value) {
    this._canceled = value;
  }

  /** @type {Promise<unknown>} */
  get popoverPromises() {
    return this._popoverPromises;
  }
  set popoverPromises(value) {
    this._popoverPromises = value;
  }

  /**
   * initialize
   * @returns {void}
   */
  initializeCallback() {
    this.addEventListener("hidden", () => {
      if (typeof this.popoverPromises !== "undefined") {
        if (this.canceled) {
          this.popoverPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.popoverPromises.resolve(buffer);
        }
        this.popoverPromises = undefined;
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        if (!this.canceled) {
          this.props[Symbols.flushBuffer]();
        }
      }
      this.canceled = true;
      // remove loop context
      const id = this.id;
      if (typeof id !== "undefined") {
        this.popoverContextIndexesById.delete(id);
      }
    });
    this.addEventListener("shown", () => {
      this.canceled = true;
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        const buffer = this.props[Symbols.createBuffer]();
        this.props[Symbols.setBuffer](buffer);
      }
      for(const key in this.props) {
        this.viewModel[Symbols.notifyForDependentProps](key, []);
      }
    });
    this.addEventListener("toggle", e => {
      if (e.newState === "closed") {
        const hiddenEvent = new CustomEvent("hidden");
        this.dispatchEvent(hiddenEvent);
      } else if (e.newState === "open") {
        const shownEvent = new CustomEvent("shown");
        this.dispatchEvent(shownEvent);
      }
    });
    //console.log("popoverMixIn:initializeCallback");
  }
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowPopover(props) {
    this.popoverPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    HTMLElement.prototype.showPopover.apply(this);
    return this.popoverPromises.promise;
  }
  /**
   * 
   */
  hidePopover() {
    this.canceled = false;
    HTMLElement.prototype.hidePopover.apply(this);
  }
  /**
   * 
   */
  cancelPopover() {
    HTMLElement.prototype.hidePopover.apply(this);
  }

  /** 
   * @type {Map<string,BindingManager>}
   * 
   */
  get popoverContextIndexesById() {
    if (typeof this._popoverContextIndexesById === "undefined") {
      this._popoverContextIndexesById = new Map;
    }
    return this._popoverContextIndexesById;
  }

  get accessibleProperties() {
    if (this.hasAttribute("popover")) {
      return ["showPopover", "asyncShowPopover", "hidePopover", "cancelPopover"];
    }
  }
}

/**
 * generate unique component class
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
function generateComponentClass(componentModule) {
  /** @type {(module:Module)=>HTMLElement.constructor} */
  const getBaseClass = function (module) {
    return class extends HTMLElement {

      /** @type {HTMLTemplateElement} */
      static template = module.template;

      /** @type {CSSStyleSheet|undefined} */
      static styleSheet = module.styleSheet;

      /** @type {CSSStyleSheet|undefined} */
      static localStyleSheet;

      /** @type {ViewModel.constructor} */
      static ViewModel = module.ViewModel ?? module.State ?? class {};

      /**@type {Object<string,FilterFuncWithOption>} */
      static inputFilters = module.filters?.input ?? {};

      /** @type {Object<string,FilterFuncWithOption>} */
      static outputFilters = module.filters?.output ?? {};

      /** @type {Object<string,EventFilterFuncWithOption>} */
      static eventFilters = module.filters?.event ?? {};

      /** @type {boolean} */
      static useShadowRoot = module.config?.useShadowRoot ?? config.useShadowRoot;

      /** @type {boolean} */
      static useWebComponent = module.config?.useWebComponent ?? config.useWebComponent;

      /** @type {boolean} */
      static useLocalTagName = module.config?.useLocalTagName ?? config.useLocalTagName;

      /** @type {boolean} */
      static useKeyed = module.config?.useKeyed ?? config.useKeyed;

      /** @type {boolean} */
      static useLocalSelector = module.config?.useLocalSelector ?? config.useLocalSelector;

      /** @type {boolean} */
      static useOverscrollBehavior = module.config?.useOverscrollBehavior ?? config.useOverscrollBehavior;

      /** @type {boolean} */
      static get [Symbols.isComponent] () {
        return true;
      }

      /**  */
      static initializeCallbacks = [];

      static accessiblePropertiesFn = [];

      static allProperties = [ "initialize", "accessibleProperties", "allProperties" ];

      /** @type {string} */
      static lowerTagName;
      /** @type {string} */
      get lowerTagName() {
        return this.constructor.lowerTagName;
      }

      /** @type {string} */
      static selectorName;
      /** @type {string} */
      get selectorName() {
        return this.constructor.selectorName;
      }

      /** @type {boolean} */
      static isAutonomousCustomElement;
      /** @type {boolean} is autonomous custom element */
      get isAutonomousCustomElement() {
        return this.constructor.isAutonomousCustomElement;
      }

      /** @type {boolean} */
      static isCostomizedBuiltInElement;
      /** @type {boolean} is costomized built-in element */
      get isCostomizedBuiltInElement() {
        return this.constructor.isCostomizedBuiltInElement;
      }

      /** @type {InputFilterManager} */
      static inputFilterManager = new InputFilterManager;

      /** @type {OutputFilterManager} */
      static outputFilterManager = new OutputFilterManager;

      /** @type {EventFilterManager} */
      static eventFilterManager = new EventFilterManager;

      /**
       */
      constructor() {
        super();
        if (typeof this.constructor.lowerTagName === "undefined") {
          const lowerTagName =  this.tagName.toLowerCase();
          const isAutonomousCustomElement = lowerTagName.includes("-");
          const customName = this.getAttribute("is");
          const isCostomizedBuiltInElement = customName ? true : false;
          this.constructor.selectorName = 
            isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
          this.constructor.lowerTagName = lowerTagName;
          this.constructor.isAutonomousCustomElement = isAutonomousCustomElement;
          this.constructor.isCostomizedBuiltInElement = isCostomizedBuiltInElement;
        }
        this.initialize();
      }

      initialize() {
        this.constructor.initializeCallbacks.forEach(callback => callback.apply(this, []));
      }

      get accessibleProperties() {
        const accessibleProperties = [];
        return this.constructor.accessiblePropertiesFn.flatMap(fn => fn.apply(this, []) ?? []).concat(accessibleProperties);
      }
      get allProperties() {
        return this.constructor.allProperties;
      }
      static {
        // setting filters
        for(const [name, filterFunc] of Object.entries(this.inputFilters)) {
          this.inputFilterManager.registerFilter(name, filterFunc);
        }
        for(const [name, filterFunc] of Object.entries(this.outputFilters)) {
          this.outputFilterManager.registerFilter(name, filterFunc);
        }
        for(const [name, filterFunc] of Object.entries(this.eventFilters)) {
          this.eventFilterManager.registerFilter(name, filterFunc);
        }
      }
    };
  };

  /** @type {Module} */
  const module = Object.assign(new Module, componentModule);
  module.filters = Object.assign({}, componentModule.filters);
  module.config = Object.assign({}, componentModule.moduleConfig ?? componentModule.config);
  module.options = Object.assign({}, componentModule.options);

  // generate new class, for customElements not define same class
  const componentClass = getBaseClass(module);
  const extendsTag = module.config?.extends ?? module.options?.extends;
  if (typeof extendsTag === "undefined") ; else {
    // case of customized built-in element
    // change class extends to extends constructor
    // See http://var.blog.jp/archives/75174484.html
    /** @type {HTMLElement.constructor} */
    const extendClass = document.createElement(extendsTag).constructor;
    componentClass.prototype.__proto__ = extendClass.prototype;
    componentClass.__proto__ = extendClass;
  }

  /**
   * mix in class
   * @param {Object.constructor} mixedClass
   */
  const classMixIn = (mixedClass) => {
    // static properties and static accessors
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixedClass))) {
      // exclude name, length, prototype
      if (!desc.enumerable && typeof desc.get === "undefined") continue;
      if (key === "accessibleProperties") {
        componentClass.accessiblePropertiesFn.push(desc.get ?? (() => desc.value));
      } else {
        Object.defineProperty(componentClass, key, desc);
      }
      componentClass.allProperties.push(key);
    }
    // instance accessors and methods
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixedClass.prototype))) {
      // exclude constructor
      if (key === "constructor") continue;
      if (key === "initializeCallback") {
        componentClass.initializeCallbacks.push(desc.value);
      } else if (key === "accessibleProperties") {
        componentClass.accessiblePropertiesFn.push(desc.get ?? (() => desc.value));
      } else {
        Object.defineProperty(componentClass.prototype, key, desc);
      }
      componentClass.allProperties.push(key);
    }

  };
  classMixIn(MixedComponent);
  classMixIn(MixedDialog);
  classMixIn(MixedPopover);

  // register component's subcomponents 
  registerComponentModules(module.componentModulesForRegister);

  return componentClass;
}

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {ComponentModule} componentModule 
 */
function registerComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = generateComponentClass(componentModule);
  const extendsTag = componentModule.moduleConfig?.extends ?? componentModule.options?.extends;
  if (typeof extendsTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:extendsTag });
  }
}

/**
 * 
 * @param {Object<string,ComponentModule>} componentModules 
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
        if (typeof module.default !== "undefined") {
          if (loadPaths.exportName in module.default) {
            moduleData = module.default[loadPaths.exportName];
          }
        } else {
          if (loadPaths.exportName in module) {
            moduleData = module[loadPaths.exportName];
          }
        }
        if (typeof moduleData === "undefined" ) {
          throw new Error(`${loadPaths.exportName} not found in module (exportName:${loadPaths.exportName}, ${loadPaths.filePath})`);
        }
      } else {
        if (typeof module.default !== "undefined") {
          moduleData = module.default;
        } else {
          moduleData = Object.assign({}, module);
        }
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

const PREFIX = "*filter-";

function extendOf(module, extendClass) {
  if (typeof module !== "function") return false;
  let testClass = module;
  while (testClass) {
    if (testClass === extendClass) return true;
    testClass = Object.getPrototypeOf(testClass);
  }
  return false;
}

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
      const { output, input, event } = module;
      output && OutputFilterManager.registerFilter(filterName, output);
      input && InputFilterManager.registerFilter(filterName, input);
      event && EventFilterManager.registerFilter(filterName, event);
    } else {
      if (extendOf(module, HTMLElement)) {
        customElements.define(name, module);
      } else {
        if ("ViewModel" in module && "html" in module) {
          registerComponentModule(name, module);
        }
      }
    }
  }
}

const loader = Loader.create(QuelModuleRegistrar);

/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {string}
 */
function getCustomTagFromImportMeta(importMeta) {
  const url = new URL(importMeta.url);
  const tagName = url.search.slice(1);
  return tagName;
}

/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {Promise<string>}
 */
async function importHtmlFromImportMeta(importMeta) {
  return await fetch(importMeta.url.replace(".js", ".html")).then(response => response.text());
}

/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {Promise<string>}
 */
async function importCssFromImportMeta(importMeta) {
  return await fetch(importMeta.url.replace(".js", ".css")).then(response => response.text());
}

const DEFAULT_CONFIG_PATH = "./quel.config.json";

/**
 * 
 * @param {{url:string,resolve:(path:string)=>string}} importMeta 
 * @param {*} configPath 
 */
async function bootFromImportMeta(importMeta, configPath) {
  const response = await fetch(importMeta.resolve(configPath ?? DEFAULT_CONFIG_PATH));
  const configData = await response.json();
  for(let [key, value] of Object.entries(config)) {
    config[key] = (typeof configData[key] !== "undefined") ? configData[key] : value;
  }
  await loader.config(configData).load();
}

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
function registerFilters(filters) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output, event } = filterData;
    input && InputFilterManager.registerFilter(name, input);
    output && OutputFilterManager.registerFilter(name, output);
    event && EventFilterManager.registerFilter(name, event);
  });
}

/**
 * 
 * @param {Object<string,any>} data 
 */
function registerGlobal(data) {
  Object.assign(GlobalData.data, data);
}

export { bootFromImportMeta, config, generateComponentClass, getCustomTagFromImportMeta, importCssFromImportMeta, importHtmlFromImportMeta, loader, registerComponentModules, registerFilters, registerGlobal };
