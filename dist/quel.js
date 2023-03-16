class utils$1 {
  /**
   * 
   * @param {string} message 
   */
  static raise(message) {
    throw message;
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
  static number       = (value, options) => Number(value);
  static boolean      = (value, options) => Boolean(value);
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
    if (name in outputFilters) utils$1.raise(`regist filter error duplicate name (${name})`);
    if (name in inputFilters) utils$1.raise(`regist filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
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
   * @type {HTMLElement}
   */
  get element() {
    return (this.node instanceof HTMLElement) ? this.node : utils$1.raise("not HTMLElement");
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
  }
  /**
   * @type {Filter[]}
   */
  filters;

  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
    this.#viewModelPropertyKey = this.viewModelProperty + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    return this.#viewModelPropertyKey;
  }
  /**
   * @type {number[]}
   */
  contextIndexes;
  
  /**
   * @type {any}
   */
  lastNodeValue;
  /**
   * @type
   */
  lastViewModelValue;

  /**
   * Nodeのプロパティを更新する
   */
  updateNode() {}

  /**
   * ViewModelのプロパティを更新する
   */
  updateViewModel() {}

  /**
   * 
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndexes(index, diff) {
    const { indexes, contextIndexes } = this;
    indexes[index] = indexes[index] + diff;
    contextIndexes[index] = contextIndexes[index] + diff;
    this.indexes = indexes;
 }

  /**
   * 
   */
  removeFromParent() { }
}

const SELECTOR = "[data-bind]";

/**
 * ルートノードから、nodeまでのchileNodesのインデックスリストを取得する
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
const isCommentNode = node => node instanceof Comment && node.textContent[0] === "@" && node.textContent[1] === "@" && node.textContent[2] !== "@";
/**
 * 
 * @param {Node} node 
 * @returns 
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
      // querySelectorAllをせずにNodeの位置を特定できる
      const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
      nodes = listOfRouteIndexes.map(routeIndexes => routeIndexes.reduce((node, routeIndex) => node.childNodes[routeIndex], rootElement));
    } else {
      // data-bindを持つノード、コメントのノードを取得しリストを作成する
      nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));

      // ルートから、nodeのインデックスの順番をキャッシュに覚えておく
      this.listOfRouteIndexesByTemplate.set(template, nodes.map(node => getNodeRoute(node)));
    }
    return nodes;

  }

}

class BindDomIf {
  /**
   * 
   * @param {Node} node
   * @param {Component} component
   * @param {string[]} indexes
   * @returns {BindInfo[]} 
   */
  static bind(node, component, indexes) { }
}

const name = "quel";

const SYM_GET_INDEXES = Symbol.for(`${name}:viewModel.indexes`);
const SYM_GET_TARGET = Symbol.for(`${name}:viewModel.target`);
const SYM_GET_DEPENDENT_MAP = Symbol.for(`${name}:viewModel.dependentMap`);
const SYM_CALL_DIRECT_GET = Symbol.for(`${name}:viewModel.directGet`);
const SYM_CALL_DIRECT_SET = Symbol.for(`${name}:viewModel.directSet`);
const SYM_CALL_DIRECT_CALL = Symbol.for(`${name}:viewModel.directCall`);
const SYM_CALL_INIT = Symbol.for(`${name}:viewModel.init`);
const SYM_CALL_CONNECT = Symbol.for(`${name}:viewModel.connect`);
const SYM_CALL_WRITE = Symbol.for(`${name}:viewModel.write`);
const SYM_CALL_CLEAR_CACHE = Symbol.for(`${name}:viewModel.clearCache`);
const SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS = Symbol.for(`${name}:viewModel.notifyForDependentProps`);

const SYM_GET_IS_PROXY = Symbol.for(`${name}:arrayHandler.isProxy`);
const SYM_GET_RAW = Symbol.for(`${name}:arrayHandler.raw`);

const SYM_CALL_BIND_DATA = Symbol.for(`${name}:componentData.bindData`);
const SYM_CALL_BIND_PROPERTY = Symbol.for(`${name}:componentData.bindProperty`);

/**
 * 
 * @param {Node} node 
 * @returns {HTMLTemplateElement}
 */
const toHTMLTemplateElement$1 = node => (node instanceof HTMLTemplateElement) ? node : utils.raise("not HTMLTemplateElement");

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
   * @type {Set<Node>}
   */
  get setOfNodes() {
    return new Set(this.childNodes);
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
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndex(index, diff) {
    this.binds.forEach(bind => bind.changeIndexes(index, diff));
  }

  /**
   * 
   * @param {Template} templateBind 
   * @param {number[]} indexes 
   * @returns {TemplateChild}
   */
  static create(templateBind, indexes) {
    const {component, template} = templateBind;
    const rootElement = document.importNode(template.content, true);
    const binds = Binder.bind(template, rootElement, component, indexes);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes, fragment:rootElement });
  }
}

class Template extends BindInfo {
  get node() {
    return super.node;
  }
  set node(node) {
    const template = toHTMLTemplateElement$1(node);
    const comment = document.createComment(`template ${template.dataset["bind"]}`);
    template.parentNode.replaceChild(comment, template);
    super.node = comment;
    this.template = template;
  }
  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];
  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    return this.#template;
  }
  set template(value) {
    this.#template = value;
  }

  updateNode() {
    const newValue = (this.nodeProperty === "loop") ? this.expandLoop() : this.expandIf();
    this.lastViewModelValue = (newValue instanceof Array) ? newValue.slice() : newValue;
  }
  
  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.forEach(child => child.removeFromParent());
/*
    const nodes = this.templateChildren.flatMap(child => child.childNodes);
    if (nodes.length > 0) {
      const oldParentNode = nodes[0].parentNode;
      const newParentNode = oldParentNode.cloneNode(false);
      oldParentNode.parentNode.replaceChild(newParentNode, oldParentNode)
      nodes.forEach(node => node.parentNode.removeChild(node));
      newParentNode.parentNode.replaceChild(oldParentNode, newParentNode);
    }
*/
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
    const { viewModel, viewModelProperty, indexes, filters } = this;
    /**
     * @type {any}
     */
    const lastValue = this.lastViewModelValue;
    /**
     * @type {any}
     */
    const newValue = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (lastValue !== newValue) {
      this.removeFromParent();
      if (newValue) {
        this.templateChildren = [TemplateChild.create(this, indexes)];
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
    const { viewModel, viewModelProperty, indexes, filters } = this;
    /**
     * @type {any[]}
     */
    const lastValue = this.lastViewModelValue ?? [];
    /**
     * @type {any[]}
     */
    const newValue = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters) ?? [];

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
    // 新しくテンプレート子要素のリストを作成する
    /**
     * @type {TemplateChild[]}
     */
    const newTemplateChildren = newValue.map((value, newIndex) => {
      const lastIndexes = indexesByLastValue.get(value);
      if (typeof lastIndexes === "undefined") {
        // 元のインデックスがない場合、新規
        lastIndexByNewIndex.set(newIndex, undefined);
        moveOrCreateIndexes.push(newIndex);
        return TemplateChild.create(this, indexes.concat(newIndex));
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = this.templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndex(indexes.length, newIndex - lastIndex);
        const prevLastIndex = lastIndexByNewIndex.get(newIndex - 1);
        if (typeof prevLastIndex === "undefined" || prevLastIndex > lastIndex) {
          moveOrCreateIndexes.push(newIndex);
        }
        return templateChild;
      }
    });
    // 削除対象、追加・移動対象のインデックスを取得
    for(const indexes of indexesByLastValue.values()) {
      for(const index of indexes) {
        this.templateChildren[index].removeFromParent();
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
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndexes(index, diff) {
    this.indexes[index] = this.indexes[index] + diff;
    this.templateChildren.forEach(templateChild => templateChild.changeIndex(index, diff));
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
    viewModelProperty = viewModelProperty === SAMENAME ? prop : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
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

const PREFIX_EVENT = "on";

/**
 * @enum {number}
 */
const NodePropertyType = {
  levelTop: 1,
  level2nd: 2,
  level3rd: 3,
  className: 10,
  radio: 20,
  checkbox: 30,
  template: 90,
  event: 91,
  component: 92,
};

class PropertyType {
  /**
   * 
   * @param {Node} node
   * @param {string} nodeProperty 
   * @returns {{type:NodePropertyType,nodePropertyElements:string[],eventType:string}}
   */
  static getInfo(node, nodeProperty) {
    const result = {type:null, nodePropertyElements:[], eventType:null};
    if (node instanceof HTMLTemplateElement) { 
      result.type = NodePropertyType.template;
      return result;
    }
    result.nodePropertyElements = nodeProperty.split(".");
    if (node instanceof Component) { 
      result.type = NodePropertyType.component;
      return result;
    }    if (result.nodePropertyElements.length === 1) {
      if (result.nodePropertyElements[0].startsWith(PREFIX_EVENT)) {
        result.type = NodePropertyType.event;
        result.eventType = result.nodePropertyElements[0].slice(PREFIX_EVENT.length);
      } else if (result.nodePropertyElements[0] === "radio") {
        result.type = NodePropertyType.radio;
      } else if (result.nodePropertyElements[1] === "checkbox") {
        result.type = NodePropertyType.checkbox;
      } else {
        result.type = NodePropertyType.levelTop;
      }
    } else if (result.nodePropertyElements.length === 2) {
      if (result.nodePropertyElements[0] === "className") {
        result.type = NodePropertyType.className;
      } else {
        result.type = NodePropertyType.level2nd;
      }
    } else if (result.nodePropertyElements.length === 3) {
      result.type = NodePropertyType.level3rd;
    } else {
      utils$1.raise(`unknown property ${nodeProperty}`);
    }
    return result;
  }
}

class NotifyData {
  /**
   * @type {Component}
   */
  component;
  /**
   * @type {string}
   */
  name;
  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
    this.#key = this.name + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #key;
  get key() {
    return this.#key;
  }

  /**
   * 
   * @param {Component} component
   * @param {string} name 
   * @param {number[]} indexes 
   */
  constructor(component, name, indexes) {
    this.component = component;
    this.name = name;
    this.indexes = indexes;
  }
}

const getNnotifyKey = notify => notify.key;

class Notifier {
  /**
   * @type {NotifyData[]}
   */
  queue = [];

  /**
   * @type {import("./Thread.js").UpdateSlotStatusCallback}
   */
  #statusCallback;
  /**
   * @param {import("./Thread.js").UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNotify);
    try {
      while(this.queue.length > 0) {
        const notifies = this.queue.splice(0);
        /**
         * @type {Map<Component,NotifyData[]>}
         */
        const notifiesByComponent = notifies.reduce((map, notify) => {
          map.get(notify.component)?.push(notify) ?? map.set(notify.component, [ notify ]);
          return map;
        }, new Map);
        
        for(const [component, notifies] of notifiesByComponent.entries()) {
          const setOfKey = new Set(notifies.map(getNnotifyKey));
          component.notify(setOfKey);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNotify);
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
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

class Processor {
  /**
   * @type {ProcessData[]}
   */
  queue = [];

  /**
   * @type {import("./Thread.js").UpdateSlotStatusCallback}
   */
  #statusCallback;
  /**
   * @param {import("./Thread.js").UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginProcess);
    try {
      while(this.queue.length > 0) {
        const processes = this.queue.splice(0);
        for(const process of processes) {
          await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endProcess);
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
 * @enum {number}
 */
const UpdateSlotStatus = {
  beginProcess: 1,
  endProcess: 2,
  beginNotify: 3,
  endNotify: 4,
  beginNodeUpdate: 5,
  endNodeUpdate: 6,
};

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */


class UpdateSlot {
  /**
   * @type {Processor}
   */
  #processor;
  /**
   * @type {Notifier}
   */
  #notifier;
  /**
   * @type {NodeUpdator}
   */
  #nodeUpdator;
  /**
   * @type {()=>{}}
   */
  #callback;
  /**
   * @type {Promise}
   */
  #promise;
  /**
   * @type {(value) => {}}
   */
  #resolve;
  /**
   * @type {() => {}}
   */
  #reject;
  
  /**
   * 
   * @param {()=>{}?} callback
   * @param {UpdateSlotStatusCallback?} statusCallback
   */
  constructor(callback = null, statusCallback = null) {
    this.#processor = new Processor(statusCallback);
    this.#notifier = new Notifier(statusCallback);
    this.#nodeUpdator = new NodeUpdator(statusCallback);
    this.#callback = callback;
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  resolve() {
    this.#resolve && this.#resolve();
    this.#resolve = null;
  }

  reject() {
    this.#reject && this.#reject();
    this.#reject = null;
  }

  async waiting() {
    return this.#promise;
  }

  async exec() {
    do {
      await this.#processor.exec();
      await this.#notifier.exec();
      await this.#nodeUpdator.exec();
    } while(!this.#processor.isEmpty || !this.#notifier.isEmpty || !this.#nodeUpdator.isEmpty);
  }

  /**
   * 
   * @param {ProcessData} processData 
   */
  addProcess(processData) {
    this.#processor.queue.push(processData);
    this.resolve();
  }
  
  /**
   * 
   * @param {NotifyData} notifyData 
   */
  addNotify(notifyData) {
    this.#notifier.queue.push(notifyData);
    this.resolve();
  }

  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  addNodeUpdate(nodeUpdateData) {
    this.#nodeUpdator.queue.push(nodeUpdateData);
    this.resolve();
  }

  /**
   * 
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns 
   */
  static create(callback, statusCallback) {
    return new UpdateSlot(callback, statusCallback);
  }

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
    this.#reject();
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
        if (typeof e !== "undefined") {
          console.error(e);
          if (!confirm("致命的なエラーが発生しました。続行しますか？")) {
            break;
          }
        }
      }
    } while(true);
  }

}

class NodeUpdateData {
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {string}
   */
  property;
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
  constructor(node, property, updateFunc) {
    this.node = node;
    this.property = property;
    this.updateFunc = updateFunc;
  }
}

class NodeUpdator {
  /**
   * @type {NodeUpdateData[]}
   */
  queue = [];

  /**
   * @type {import("./Thread.js").UpdateSlotStatusCallback}
   */
  #statusCallback;
  /**
   * @param {import("./Thread.js").UpdateSlotStatusCallback} statusCallback
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
      if (update2.node instanceof HTMLTemplateElement) return 1;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value") return 1;
      return -1;
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
        const updates = this.reorder(this.queue.splice(0));
        updates.forEach(update => Reflect.apply(update.updateFunc, update, []));
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
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        node[nodeProperty] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const value = Filter.applyForInput(node[nodeProperty], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
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

  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        node[nodeProperty1][nodeProperty2] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
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
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        node[nodeProperty1][nodeProperty2][nodeProperty3] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2][nodeProperty3], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
  }

}

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement$1 = node => (node instanceof HTMLElement) ? node : utils.raise(`not HTMLElement`);

class ClassName extends BindInfo {
  get className() {
    return this.nodePropertyElements[1];
  }
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters, className} = this;
    const element = toHTMLElement$1(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        value ? element.classList.add(className) : element.classList.remove(className);
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters, className} = this;
    const element = toHTMLElement$1(node);
    const value = Filter.applyForInput(element.classList.contains(className), filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
  }
}

const toHTMLInputElement$1 = node => (node instanceof HTMLInputElement) ? node : utils$1.raise();

class Radio extends BindInfo {
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const radio = toHTMLInputElement$1(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        radio.checked = value === radio.value;
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const radio = toHTMLInputElement$1(node);
    const radioValue = Filter.applyForInput(radio.value, filters);
    if (radio.checked) {
      viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, radioValue);
      this.lastViewModelValue = radioValue;
    }
  }
}

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils$1.raise();

class Checkbox extends BindInfo {
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        checkbox.checked = value.find(value => value === checkbox.value);
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = bind;
    const checkbox = toHTMLInputElement(node);
    const checkboxValue = Filter.applyForInput(checkbox.value, filters);
    const setOfValue = new Set(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes));
    (checkbox.checked) ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
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
      const contextIndexes = this.contextIndexes;
      const process = new ProcessData(
        viewModel[SYM_CALL_DIRECT_CALL], viewModel, [viewModelProperty, contextIndexes, event]
      );
      component.updateSlot.addProcess(process);
    });
  }
}

class PropertyInfo {

  name;
  elements;
  loopLevel;
  parentName;
  lastElement;
  regexp;
  isPrimitive;
  privateName;
  isObject;
  isLoop;
  isNotPrimitive;

  constructor(name) {
    this.name = name;
    this.elements = name.split(".");
    this.loopLevel = this.elements.reduce((count, element) => count + ((element === "*") ? 1 : 0), 0);
    this.parentName = this.elements.slice(0, -1).join(".");
    this.lastElement = this.elements.at(-1) ?? null;
    this.regexp = (this.loopLevel > 0) ? new RegExp("^" + name.replaceAll("*", "(\\w+)").replaceAll(".", "\\.") + "$") : null;
    this.isPrimitive = this.elements.length === 1 && this.loopLevel === 0;
    this.privateName = this.isPrimitive ? ("_" + name) : null;
    this.isObject = this.elements.length > 1 && this.loopLevel === 0;
    this.isLoop = this.elements.length > 1 && this.loopLevel > 0;
    this.isNotPrimitive = ! this.isPrimitive ;
  }
  get parentProperty() {
    return PropertyInfo.create(this.parentName);
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @returns 
   */
  primitiveGetter(viewModel) {
    return viewModel[this.privateName];
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {any} value 
   * @returns 
   */
  primitiveSetter(viewModel, value) {
    viewModel[this.privateName] = value;
    return true;
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @returns 
   */
  nonPrimitiveGetter(viewModel) {
    const { parentName, loopLevel, lastElement } = this;
    const index = (lastElement === "*") ? viewModel[SYM_GET_INDEXES][loopLevel - 1] : lastElement;
    return viewModel[parentName][index];
  }
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {any} value 
   * @returns 
   */
  nonPrimitiveSetter(viewModel, value) {
    const { parentName, loopLevel, lastElement } = this;
    const index = (lastElement === "*") ? viewModel[SYM_GET_INDEXES][loopLevel - 1] : lastElement;
    viewModel[parentName][index] = value;
    return true;
  }
  /**
   * 
   * @param {Component} component 
   * @returns {PropertyDescriptor}
   */
  createPropertyDescriptor(component) {
    return {
      get : this.isPrimitive ?
        () => Reflect.apply(this.primitiveGetter, this, [component.viewModel]) : 
        () => Reflect.apply(this.nonPrimitiveGetter, this, [component.viewModel]),
      set : this.isPrimitive ?
        value => Reflect.apply(this.primitiveSetter, this, [component.viewModel, value]) : 
        value => Reflect.apply(this.nonPrimitiveSetter, this, [component.viewModel, value]),
      enumerable: true, 
      configurable: true,
    }
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {number[]} indexes 
   * @returns {number[][]}
   */
  expand(viewModel, indexes) {
    if (this.loopLevel === indexes.length) {
      return [ indexes ];
    } else if (this.loopLevel < indexes.length) {
      return [ indexes.slice(0, this.loopLevel) ];
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
        const element = this.elements[elementIndex];
        const isTerminate = (this.elements.length - 1) === elementIndex;
        let retValues;
        if (element === "*") {
          if (loopIndexes.length < indexes.length) {
            retValues = isTerminate ? [ indexes.slice(0, loopIndexes.length + 1) ] :
              traverse(parentNameDot + element, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
          } else {
            retValues = (viewModel[SYM_CALL_DIRECT_GET](parentName, loopIndexes) ?? []).flatMap((value, index) => {
              return isTerminate ? [ loopIndexes.concat(index) ] :
                traverse(parentNameDot + element, elementIndex + 1, loopIndexes.concat(index));
            });
          }
        } else {
          retValues = isTerminate ? [ loopIndexes ] : 
           traverse(parentNameDot + element, elementIndex + 1, loopIndexes);
        }
        return retValues;

      };
      const listOfIndexes = traverse("", 0, []);
      return listOfIndexes;

    }

  }

  /**
   * @type {Map<string,PropertyInfo>}
   */
  static #propertyInfoByProp = new Map;
  static create(prop) {
    if (prop === "") return undefined;
    let propertyInfo = this.#propertyInfoByProp.get(prop);
    if (typeof propertyInfo === "undefined") {
      propertyInfo = new PropertyInfo(prop);
      this.#propertyInfoByProp.set(prop, propertyInfo);
    }
    return propertyInfo;
  }
  
}

const toComponent = node => (node instanceof Component) ? node : undefined;

class ComponentBind extends BindInfo {
  /**
   * @type {Node}
   */
  get node() {
    return super.node;
  }
  set node(node) {
    super.node = node;
    this.bindData();
  }
  /**
   * @type {string}
   */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.viewModelProperty && this.nodePropertyElements) {
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
    if (this.viewModelProperty && this.nodePropertyElements) {
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

  /**
   * 
   */
  bindData() {
    const component = toComponent(this.node);
    component?.data[SYM_CALL_BIND_DATA](component);
  }

  /**
   * 
   */
  bindProperty() {
    const component = toComponent(this.node);
    component?.data[SYM_CALL_BIND_PROPERTY](this.dataProperty, this.viewModelProperty, this.indexes);
  }

  updateNode() {
    const { node, dataProperty } = this;
    const thisComponent = toComponent(node);
    thisComponent.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$data.${dataProperty}`, []);
  }

  updateViewModel() {
  }

}

const createLevelTop = (bindInfo, info) => Object.assign(new LevelTop, bindInfo, info);
const createLevel2nd = (bindInfo, info) => Object.assign(new Level2nd, bindInfo, info);
const createLevel3rd = (bindInfo, info) => Object.assign(new Level3rd, bindInfo, info);
const createClassName = (bindInfo, info) => Object.assign(new ClassName, bindInfo, info);
const createRadio = (bindInfo, info) => Object.assign(new Radio, bindInfo, info);
const createCheckbox = (bindInfo, info) => Object.assign(new Checkbox, bindInfo, info);
const createTemplate = (bindInfo, info) => Object.assign(new Template, bindInfo, info);
const createEvent = (bindInfo, info) => Object.assign(new Event, bindInfo, info);
const createComponent = (bindInfo, info) => Object.assign(new ComponentBind, bindInfo, info);

const creatorByType = new Map();
creatorByType.set(NodePropertyType.levelTop, createLevelTop);
creatorByType.set(NodePropertyType.level2nd, createLevel2nd);
creatorByType.set(NodePropertyType.level3rd, createLevel3rd);
creatorByType.set(NodePropertyType.className, createClassName);
creatorByType.set(NodePropertyType.radio, createRadio);
creatorByType.set(NodePropertyType.checkbox, createCheckbox);
creatorByType.set(NodePropertyType.template, createTemplate);
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
   * indexes:number[]
   * }}  
   */
  static create({component, node, nodeProperty, viewModel, viewModelProperty, filters, indexes}) {
    const bindInfo = {component, node, nodeProperty, viewModel, viewModelProperty, filters};
    const propInfo = PropertyInfo.create(viewModelProperty);
    bindInfo.indexes = indexes.slice(0, propInfo.loopLevel);
    bindInfo.contextIndexes = indexes;
    const info = PropertyType.getInfo(node, nodeProperty);
    return creatorByType.get(info.type)(bindInfo, info);
  }
}

const DATASET_BIND_PROPERTY$1 = "bind";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLTemplateElement}
 */
const toHTMLTemplateElement = node => (node instanceof HTMLTemplateElement) ? node : utils$1.raise("not HTMLTemplateElement");

/**
 * @param {BindInfo} bind 
 * @returns {Template}
 */
const toTemplate$1 = bind => (bind instanceof Template) ? bind : undefined;

class BindToTemplate extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {number[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, component, indexes) {
    const viewModel = component.viewModel;
    const template = toHTMLTemplateElement(node);
    const bindText = template.dataset[DATASET_BIND_PROPERTY$1];
    const binds = Parser
      .parse(bindText, "")
      .map(info => { 
        const bind = Factory.create(Object.assign(info, {node, component, viewModel, indexes:indexes.slice()}));
        return bind;
      });
    if (binds.length === 0) return [];
    const templateBind = toTemplate$1(binds[0]);
    if (templateBind) {
      if (templateBind.nodeProperty !== "if" && templateBind.nodeProperty !== "loop") {
        utils$1.raise(`unknown node property ${templateBind.nodeProperty}`);
      }
      templateBind.updateNode();
      return [ templateBind ];
    } else {
      utils$1.raise(`not template bind`);
    }
  }
}

const DATASET_BIND_PROPERTY = "bind";
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
 * 
 * @param {HTMLElement} element 
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : "value") : 
  DEFAULT_PROPERTY$1;
};

const toEvent = bind => (bind instanceof Event) ? bind : undefined; 

class BindToElement extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {number[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, component, indexes) {
    const viewModel = component.viewModel;
    const element = toHTMLElement(node);
    const bindText = element.dataset[DATASET_BIND_PROPERTY];
    const defaultName = getDefaultProperty(element);

    // パース
    const binds = Parser
        .parse(bindText, defaultName)
        .map(info => {
          const bind = Factory.create(Object.assign(info, {node, component, viewModel, indexes:indexes.slice()}));
          bind.updateNode();
          return bind;
        });

    // イベントハンドラ設定
    let hasDefaultEvent = false;
    /**
     * @type {BindInfo}
     */
    let defaultBind = null;
    binds.forEach(bind => {
      hasDefaultEvent ||= bind.nodeProperty === DEFAULT_EVENT;
      defaultBind = (bind.nodeProperty === defaultName) ? bind : defaultBind;
      const event = toEvent(bind);
      event && event.addEventListener();
    });

    if (defaultBind && !hasDefaultEvent) {
      element.addEventListener(DEFAULT_EVENT_TYPE, (event) => {
        event.stopPropagation();
        const process = new ProcessData(defaultBind.updateViewModel, defaultBind, []);
        component.updateSlot.addProcess(process);
      });
    }

    return binds;
  }

}

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils$1.raise("not Comment");

class BindToText extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {number[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, component, indexes) {
    // コメントノードをテキストノードに差し替える
    const viewModel = component.viewModel;
    const comment = toComment(node);
    const bindText = comment.textContent.slice(2); // @@をスキップ
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);
    // パース
    const binds = Parser
      .parse(bindText, DEFAULT_PROPERTY)
      .map(info => {
        const bind = Factory.create(Object.assign(info, {node:textNode, component, viewModel, indexes:indexes.slice()}));
        bind.updateNode();
        return bind;
      });
    return binds;
  }

}

class Binder {
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement 
   * @param {Component} component
   * @param {number[]?} indexes
   * @returns {BindInfo[]}
   */
  static bind(template, rootElement, component, indexes = []) {
    const nodes = Selector.getTargetNodes(template, rootElement);
    return nodes.flatMap(node => 
      (node instanceof HTMLTemplateElement) ? BindToTemplate.bind(node, component, indexes) :
      (node instanceof HTMLElement) ? BindToElement.bind(node, component, indexes) :
      (node instanceof Comment) ? BindToText.bind(node, component, indexes) : 
      utils$1.raise(`unknown node type`)
    );
  }

}

const toTemplate = bind => (bind instanceof Template) ? bind : undefined;

class Binds {
  /**
   * @type {BindInfo[]}
   */
  #binds;
  /**
   * @type {Map<string,BindInfo[]>}
   */
  #bindsByKey = new Map;
  constructor(binds) {
    this.#binds = binds;
    this.buildMap();
  }

  buildMap() {
    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const buildMap = (binds) => {
      binds.forEach(bind => {
        this.#bindsByKey.get(bind.viewModelPropertyKey)?.push(bind) ?? this.#bindsByKey.set(bind.viewModelPropertyKey, [ bind ]);
        (toTemplate(bind)?.templateChildren ?? []).forEach(templateChild => buildMap(templateChild.binds));
      });
    };
    this.#bindsByKey.clear();
    buildMap(this.#binds);
  }
  /**
   * 
   * @param {Set<string>} setOfKey 
   * @returns {Template[]}
   */
  getTemplateBinds(setOfKey) {
    const templateBinds = [];
    const stack = [ { binds:this.#binds, children:null, index:-1 } ];
    while(stack.length > 0) {
      const info = stack[stack.length - 1];
      info.index++;
      if (info.binds) {
        if (info.index < info.binds.length) {
          const template = toTemplate(info.binds[info.index]);
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
   * @param {Set<string>} setOfKey 
   */
  updateViewModel(setOfKey) {
    // templateを先に展開する
    /**
     * @type {Set<Template>}
     */
    const templateBinds = new Set(this.getTemplateBinds(setOfKey));
    if (templateBinds.size > 0) {
      for(const templateBind of templateBinds) {
        templateBind.updateNode();
      }
      this.buildMap();
    }

    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const updateViewModelProperty = (binds) => {
      binds.forEach(bind => {
        if (!templateBinds.has(bind) && setOfKey.has(bind.viewModelPropertyKey)) {
          bind.updateNode();
        }
        toTemplate(bind)?.templateChildren.forEach(templateChild => updateViewModelProperty(templateChild.binds));
      });
    };
    updateViewModelProperty(this.#binds);
  }

}

class View {
  /**
   * @type {HTMLTemplateElement}
   */
  template;
  /**
   * @type {HTMLElement}
   */
  rootElement;

  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement 
   */
  constructor(template, rootElement) {
    this.template = template;
    this.rootElement = rootElement;
  }

  /**
   * @param {Component} component
   * @returns {Binds}
   */
  render(component) {
    const content = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    const binds = new Binds(Binder.bind(this.template, content, component));
    this.rootElement.appendChild(content);
    return binds;
  }

}

const notPrivate = property => property[0] !== "_";
const DEPENDENT_PROP = "$dependentProps";

/**
 * 
 * @param {{prop:string,refProps:string[]}[]} dependentProps
 * @returns 
 */
function createDependentMap(dependentProps) {
  const map = new Map();
  Object.entries(dependentProps).forEach(([prop, refProps]) => {
    refProps.forEach(refProp => {
      map.get(refProp)?.push(prop) ?? map.set(refProp, [ prop ]);
    }); 
  });
  return map;
}

class Accessor {
  /**
   * 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @returns {{viewmodel:ViewModel, definedProperties:PropertyInfo[], dependentMap:Map<string,string[]>, cachablePropertyNames:string[]}}
   */
  static convert(component, viewModel) {
    let dependentMap = new Map;
    // $dependentPropsを取得
    if (DEPENDENT_PROP in viewModel) {
      const desc = Object.getOwnPropertyDescriptor(viewModel, DEPENDENT_PROP);
      desc.enumerable = false;
      Object.defineProperty(viewModel, DEPENDENT_PROP, desc);
      dependentMap = createDependentMap(desc.value);
    }
    // プライベートプロパティを列挙不可にする
    for(const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(viewModel))) {
      if (notPrivate(prop)) continue;
      desc.enumerable = false;
      Object.defineProperty(viewModel, prop, desc);
    }

    // 普通のプロパティをgetter/setter化する
    const accessorProperties = 
      Object.keys(viewModel).filter(notPrivate).map(property => PropertyInfo.create(property));

    accessorProperties.forEach(property => {
      const value = viewModel[property.name];
      delete viewModel[property.name];
      const desc = property.createPropertyDescriptor(component);
      Object.defineProperty(viewModel, property.name, desc);

      if (!(property.privateName in viewModel)) {
        const privateDesc = {
          value,
          writable: true, 
          enumerable: false, 
          configurable: true,
        };
        Object.defineProperty(viewModel, property.privateName, privateDesc);
      }
    });

    // getterを列挙可にする
    const cachablePropertyNames = [];
    for(const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(viewModel)))) {
      if (prop === "constructor") continue;
      if (utils$1.isFunction(desc.value)) continue;
      desc.enumerable = true;
      Object.defineProperty(viewModel, prop, desc);
      cachablePropertyNames.push(prop);
    }
    const definedProperties = Object.keys(viewModel).map(prop => PropertyInfo.create(prop));

    // definedPropertiesからdependentMapに追加
    definedProperties.forEach(property => {
      if (property.isPrimitive) return;
      const props = dependentMap.get(property.parentName)?.concat(property.name) ?? [ property.name ];
      dependentMap.set(property.parentName, props);
    });

    return { viewModel, definedProperties, dependentMap, cachablePropertyNames };

  }
}

/**
 * キャッシュのキーは、プロパティとインデックス
 */

class CacheValue {
  /**
   * @type { boolean }
   */
  dirty = false;
  /**
   * @type { any }
   */
  value;

  /**
   * 
   * @param {any} value 
   */
  constructor(value) {
    this.value = value;
  }
}


class Cache {
  /**
   * @type {Map<PropertyInfo,Map<string,CacheValue>>}
   */
  #cacheValueByIndexesByProp = new Map();
  /**
   * @type {PropertyInfo[]}
   */
  #definedProperties;
  /**
   * @type {Map<string,PropertyInfo[]>}
   */
  #definedPropertiesByParentName;
  /**
   * @type {Map<string,PropertyInfo[]>}
   */
  #dependentPropsByName;

  /**
   * 
   * @param {PropertyInfo[]} definedProperties 
   */
  constructor(definedProperties) {
    this.#definedProperties = definedProperties;
    this.#definedPropertiesByParentName = definedProperties
    .filter(definedProperty => definedProperty.parentName !== "")
    .reduce((map, definedProperty) => {
      map.get(definedProperty.parentName)?.push(definedProperty) ??
      map.set(definedProperty.parentName, [ definedProperty ]);
      return map;
    }, new Map);
    const getDependentProps = (properties, propertyName) => {
      (this.#definedPropertiesByParentName.get(propertyName) ?? []).forEach(definedProperty => {
        properties.push(definedProperty);
        getDependentProps(properties, definedProperty.name);
      });
      return properties;
    };
    this.#dependentPropsByName = 
      new Map(definedProperties.map(property => [ property.name, getDependentProps(new Array, property.name) ]));
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {any}
   */
  get(property, indexes) {
    const cacheValue = this.#cacheValueByIndexesByProp.get(property)?.get(indexes.toString());
    return cacheValue ? (!cacheValue.dirty ? cacheValue.value : undefined) : undefined;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @param {any} value 
   */
  set(property, indexes, value) {
    let cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
    if (typeof cacheValueByIndexes === "undefined") {
      cacheValueByIndexes = new Map();
      this.#cacheValueByIndexesByProp.set(property, cacheValueByIndexes);
    }
    cacheValueByIndexes.set(indexes.toString(), new CacheValue(value));
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   * @returns {boolean}
   */
  has(property, indexes) {
    const cacheValue = this.#cacheValueByIndexesByProp.get(property)?.get(indexes.toString());
    return cacheValue ? (!cacheValue.dirty) : false;
  }

  /**
   * 
   * @param {PropertyInfo} property 
   * @param {number[]} indexes 
   */
  delete(property, indexes) {
    const indexesString = indexes.slice(0, property.loopLevel).toString();
    const indexesStarts = indexesString + ",";
    let cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
    if (cacheValueByIndexes) {
      for(const indexes of cacheValueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          cacheValueByIndexes.get(indexes).dirty = true;
        }
      }
    }
    const dependentProps = this.#dependentPropsByName.get(property.name) ?? [];
    dependentProps.forEach(property => {
      const cacheValueByIndexes = this.#cacheValueByIndexesByProp.get(property);
      if (typeof cacheValueByIndexes === "undefined") return;
      for(const indexes of cacheValueByIndexes.keys()) {
        if (indexesString === "" || indexes === indexesString || indexes.startsWith(indexesStarts)) {
          cacheValueByIndexes.get(indexes).dirty = true;        }
      }
    });
  }

  clear() {
    this.#cacheValueByIndexesByProp.clear();
  }
}

/**
 * 配列プロキシ
 * 更新（追加・削除）があった場合、更新通知を送る機能を付加する
 */
class ArrayHandler {
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {PropertyInfo}
   */
  #prop;
  /**
   * ループインデックス
   * @type {number[]}
   */
  #indexes;
  /**
   * コンストラクタ
   * @param {Component} component 
   * @param {string} prop 
   * @param {number[]} indexes
   */
  constructor(component, prop, indexes) {
    this.#component = component;
    this.#prop = prop;
    this.#indexes = indexes;
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
    if (prop === SYM_GET_IS_PROXY) return true;
    if (prop === SYM_GET_RAW) return target;
    return Reflect.get(target, prop, receiver);
  }

  /**
   * setter
   * lengthプロパティの場合、変更通知を送信する
   * $onwriteを呼び出したいので、viewModelのプロパティに値をセットする
   * @param {Object} target Array
   * @param {string} prop プロパティ
   * @param {Any} value 
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    if (prop === "length") {
      const component = this.#component;
      const viewModel = component.viewModel;
      const propName = this.#prop.name;
      component.updateSlot.addProcess(new ProcessData(() => {
        viewModel[propName] = target;
      }, viewModel, []));
    }
    return true;
  }
}

/**
 * 
 * @param {Array<any>} array 
 * @param {Component} component 
 * @param {PropertyInfo} prop 
 * @param {number[]} indexes 
 * @returns 
 */
function create$1(array, component, prop, indexes) {
  return new Proxy(array, new ArrayHandler(component, prop, indexes))
}

let Handler$3 = class Handler {
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    GlobalData.binds
    .filter(bind => prop === bind.globalProperty)
    .forEach(bind => {
      const [dataProp, nameProp] = bind.componentProperty.split(".");
      bind.component.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$data.${nameProp}`, []);
    });
    GlobalData.globalBinds
    .filter(bind => prop === bind.globalProperty)
    .forEach(bind => {
      bind.component.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$globals.${prop}`, []);
    });
    return true;
  }
};

class GlobalData {
  /**
   * @type {{globalProperty:string,component:Component,componentProperty:string}[]}
   */
  static binds = [];
  /**
   * @type {{globalProperty:string,component:Component}[]}
   */
  static globalBinds = [];
  /**
   * 
   * @param {Component} component 
   */
  static boundFromComponent(component) {
    component.data[SYM_CALL_BIND_DATA](this.data);
  }
  /**
   * 
   * @param {string} globalProperty 
   * @param {Component} component 
   * @param {string} componentProperty 
   */
  static boundPropertyFromComponent(globalProperty, component, componentProperty) {
    this.binds.push({ globalProperty, component, componentProperty });
    component.data[SYM_CALL_BIND_PROPERTY](componentProperty, globalProperty);
  }
  /**
   * 
   * @param {Component} component 
   * @param {string} globalProperty
   */
  static globalBoundFromComponent(component, globalProperty) {
    this.globalBinds.push({ component, globalProperty });
  }
  /**
   * 
   * @returns 
   */
  static create() {
    return new Proxy({}, new Handler$3);
  }
  /**
   * @type {Object<string,any>}
   */
  static data = this.create();

}

let Handler$2 = class Handler {
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

  /**
   * @type {Set<string>}
   */
  setOfBindParams = new Set;

  boundFromComponent(globalProperty) {
    GlobalData.globalBoundFromComponent(this.component, globalProperty);
    this.setOfBindParams.add(globalProperty);

  }
  get(target, prop, receiver) {
    if (!this.setOfBindParams.has(prop)) {
      this.boundFromComponent(prop);
    }
    return Reflect.get(target, prop, target);
  }

  set(target, prop, value, receiver) {
    if (!this.setOfBindParams.has(prop)) {
      this.boundFromComponent(prop);
    }
    Reflect.set(target, prop, value, target);
    return true;
  }
};

class Globals {
  /**
   * 
   * @param {Component} component 
   * @returns 
   */
  static create(component) {
    return new Proxy(GlobalData.data, new Handler$2(component))
  }

}

const MAX_INDEXES_LEVEL = 8;
const CONTEXT_INDEXES = [...Array(MAX_INDEXES_LEVEL)].map((content,index) => "$" + (index + 1));
const SET_OF_CONTEXT_INDEXES = new Set(CONTEXT_INDEXES);
const CONTEXT_COMPONENT = "$component";
const CONTEXT_DATA = "$data";
const CONTEXT_OPEN_DIALOG = "$openDialog";
const CONTEXT_CLOSE_DIALOG = "$closeDialog";
const CONTEXT_NOTIFY = "$notify";
const CONTEXT_GLOBALS = "$globals";
const CONTEXT_PARAMS = [CONTEXT_COMPONENT, CONTEXT_DATA, CONTEXT_OPEN_DIALOG, CONTEXT_CLOSE_DIALOG, CONTEXT_NOTIFY, CONTEXT_GLOBALS];
const SET_OF_CONTEXT_ALL_PARAMS = new Set(CONTEXT_INDEXES.concat(CONTEXT_PARAMS));

/**
 * 配列プロキシを取得
 * 配列プロキシのプロキシといった重複をさけるため、
 * いったん元の配列を求めてからプロキシにする
 * @param {Component} component 
 * @param {PropertyInfo} prop 
 * @param {number[]} indexes
 * @param {any} value 
 * @returns 
 */
const wrapArray = (component, prop, indexes, value) => {
  value = value?.[SYM_GET_IS_PROXY] ? value[SYM_GET_RAW] : value;
  return (value instanceof Array) ? create$1(value, component, prop, indexes) : value;
};

let Handler$1 = class Handler {
  /**
   * @type {Cache}
   */
  cache;
  /**
   * @type {Map<string,{indexes:number[],propertyInfo:PropertyInfo}>}
   */
  propertyInfoAndIndexesByProp = new Map();
  /**
   * @type {number[][]}
   */
  stackIndexes = [];
  /**
   * @type {Component}
   */
  component;
  /**
   * @type {Map<string,PropertyInfo>}
   */
  definedPropertyByProp = new Map;
  /**
   * @type {PropertyInfo[]}
   */
  loopProperties = [];

  /**
   * @type {Map<string,string[]>}
   */
  dependentMap;
  /**
   * @type {Map<string,Set<string>>}
   */
  setOfDependentPropNamesByPropName = new Map;
  /**
   * @type {string[]}
   */
  cachablePropertyNames = [];
  setOfCachablePropertyNames = new Set;
  /**
   * 
   */
  globals;
  /**
   * 
   * @param {Component} component 
   * @param {PropertyInfo[]} definedProperties
   * @param {Map<string,string[]>} dependentMap
   * @param {string[]} cachablePropertyNames
   */
  constructor(component, definedProperties, dependentMap, cachablePropertyNames) {
    this.component = component;
    this.definedPropertyByProp = new Map(definedProperties.map(property => ([property.name, property])));
    this.loopProperties = definedProperties.filter(property => property.isLoop);
    this.dependentMap = dependentMap;
    this.cachablePropertyNames = cachablePropertyNames;
    this.setOfCachablePropertyNames = new Set(cachablePropertyNames);
    this.cache = new Cache(definedProperties);
    const getDependentProps = (setOfPropertyNames, propertyName) => {
      (dependentMap.get(propertyName) ?? []).forEach(refPropertyName => {
        if (!setOfPropertyNames.has(refPropertyName)) {
          setOfPropertyNames.add(refPropertyName);
          getDependentProps(setOfPropertyNames, refPropertyName);
        }
      });
      return setOfPropertyNames;
    };
    this.setOfDependentPropNamesByPropName = 
      new Map(Array.from(dependentMap.keys()).map(propertyName => [propertyName, getDependentProps(new Set, propertyName)]));
    this.globals = Globals.create(component);

  }

  get lastIndexes() {
    return this.stackIndexes[this.stackIndexes.length - 1] ?? [];
  }

  async [SYM_CALL_INIT](target, receiver) {
    if (!("$oninit" in target)) return;
    return await Reflect.apply(target["$oninit"], receiver, []);
  }

  async [SYM_CALL_CONNECT](target, receiver) {
    if (!("$onconnect" in target)) return;
    return await Reflect.apply(target["$onconnect"], receiver, []);
  }

  /**
   * 
   * @param {string} prop 
   * @param {number[]} indexes 
   * @param {*} target 
   * @param {*} receiver 
   */
  [SYM_CALL_WRITE](prop, indexes, target, receiver) {
    if ("$onwrite" in target) {
      const { component } = this;
      const process = new ProcessData(target["$onwrite"], receiver, [ prop, indexes ]);
      component.updateSlot.addProcess(process);
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {Proxy<ViewModel>} receiver 
   */
  #getDefinedPropertyValue(target, prop, receiver) {
    const { component, lastIndexes, cache, setOfCachablePropertyNames } = this;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    let value;
    if (setOfCachablePropertyNames.has(prop.name)) {
      const cacheValue = cache.get(prop, indexes);
      if (typeof cacheValue === "undefined") {
        value = Reflect.get(target, prop.name, receiver);
        cache.set(prop, indexes, value);
      } else {
        value = cacheValue;
      }
    } else {
      value = Reflect.get(target, prop.name, receiver);
    }
    return wrapArray(component, prop, indexes, value);
  }

  [SYM_CALL_DIRECT_GET](prop, indexes, target, receiver) {
    let value;
    this.stackIndexes.push(indexes);
    try {
      value = receiver[prop];
    } finally {
      this.stackIndexes.pop();
    }
    return value;
  }

  [SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](propertyName, indexes, target, receiver) {
    const { dependentMap, setOfDependentPropNamesByPropName, component } = this;
    if (dependentMap.has(propertyName)) {
      const dependentPropNames = setOfDependentPropNamesByPropName.get(propertyName) ?? new Set;
      dependentPropNames.forEach(definedPropertyName => {
        
        if (definedPropertyName.startsWith("$data")) {
          component.updateSlot.addNotify(new NotifyData(component, definedPropertyName, []));
        } else {
          const definedProperty = PropertyInfo.create(definedPropertyName);
          if (indexes.length < definedProperty.loopLevel) {
            const listOfIndexes = definedProperty.expand(receiver, indexes);
            listOfIndexes.forEach(depIndexes => {
              component.updateSlot.addNotify(new NotifyData(component, definedProperty.name, depIndexes));
            });
          } else {
            const depIndexes = indexes.slice(0, definedProperty.loopLevel);
            component.updateSlot.addNotify(new NotifyData(component, definedProperty.name, depIndexes));
          }
  
        }
      });
    }
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {PropertyInfo} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
  #setDefinedPropertyValue(target, prop, value, receiver) {
    const { component, lastIndexes, cache } = this;
    value = value?.[SYM_GET_IS_PROXY] ? value[SYM_GET_RAW] : value;
    const indexes = lastIndexes.slice(0, prop.loopLevel);
    Reflect.set(target, prop.name, value, receiver);

    component.updateSlot.addNotify(new NotifyData(component, prop.name, indexes));

    this[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](prop.name, indexes, target, receiver);

    this[SYM_CALL_WRITE](prop.name, lastIndexes, target, receiver);

    return true;
  }

  [SYM_CALL_DIRECT_SET](prop, indexes, value, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      receiver[prop] = value;
    } finally {
      this.stackIndexes.pop();
    }
    return true;
  }

  async [SYM_CALL_DIRECT_CALL](prop, indexes, event, target, receiver) {
    this.stackIndexes.push(indexes);
    try {
      await Reflect.apply(target[prop], receiver, [event, ...indexes]);
    } finally {
      this.stackIndexes.pop();
    }
  }

  [SYM_CALL_CLEAR_CACHE](target, receiver) {
    this.cache.clear();
  }

  /**
   * 
   * @param {string} prop 
   * @returns {{loopProperty:PropertyInfo,indexes:number[]}}
   */
  #getLoopPropertyAndIndexesFromPropertyName(prop) {
    let { loopProperty, indexes } = this.propertyInfoAndIndexesByProp.get(prop) ?? {};
    if (typeof loopProperty === "undefined") {
      for(const property of this.loopProperties) {
        const result = property.regexp.exec(prop);
        if (result) {
          indexes = result.slice(1).map(Number);
          loopProperty = property;
          this.propertyInfoAndIndexesByProp.set(prop, { loopProperty, indexes });
          break;
        }
      }
    }
    return { loopProperty, indexes };
  }
  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy<ViewModel>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (typeof prop === "symbol") {
      const { lastIndexes, dependentMap } = this;
      switch(prop) {
        case SYM_CALL_DIRECT_GET:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_DIRECT_GET], this, [prop, indexes, target, receiver]);
        case SYM_CALL_DIRECT_SET:
          return (prop, indexes, value) => 
            Reflect.apply(this[SYM_CALL_DIRECT_SET], this, [prop, indexes, value, target, receiver]);
        case SYM_GET_INDEXES:
          return lastIndexes;
        case SYM_CALL_DIRECT_CALL:
          return (prop, indexes, event) => 
            Reflect.apply(this[SYM_CALL_DIRECT_CALL], this, [prop, indexes, event, target, receiver]);
        case SYM_CALL_INIT:
          return () => 
            Reflect.apply(this[SYM_CALL_INIT], this, [target, receiver]);
        case SYM_CALL_WRITE:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_WRITE], this, [prop, indexes, target, receiver]);
        case SYM_CALL_CONNECT:
          return () => 
            Reflect.apply(this[SYM_CALL_CONNECT], this, [target, receiver]);
        case SYM_CALL_CLEAR_CACHE:
          return () => 
            Reflect.apply(this[SYM_CALL_CLEAR_CACHE], this, [target, receiver]);
        case SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS:
          return (prop, indexes) => 
            Reflect.apply(this[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS], this, [prop, indexes, target, receiver]);
        case SYM_GET_TARGET:
          return target;
        case SYM_GET_DEPENDENT_MAP:
          return dependentMap;
      }
    }
    if (SET_OF_CONTEXT_ALL_PARAMS.has(prop)) {
      const { lastIndexes, component } = this;
      if (SET_OF_CONTEXT_INDEXES.has(prop)) {
        return lastIndexes[Number(prop.slice(1)) - 1];
      } else {
        switch(prop) {
          case CONTEXT_COMPONENT:
            return component;
          case CONTEXT_DATA:
            return component.data;
          case CONTEXT_OPEN_DIALOG:
            return async (name, data, attributes) => {
              const dialog = document.createElement(name);
              Object.entries(attributes ?? {}).forEach(([key, value]) => {
                dialog.setAttribute(key, value);
              });
              dialog.data[SYM_CALL_BIND_DATA](data ?? {});
              document.body.appendChild(dialog);
              return dialog.alivePromise;
            };
          case CONTEXT_CLOSE_DIALOG:
            return (data) => {
              Object.assign(component.data, data);
              component.parentNode.removeChild(component);
            };
          case CONTEXT_NOTIFY:
            return (prop, indexes) => {
              component.updateSlot.addNotify(new NotifyData(component, prop, indexes));
            };
          case CONTEXT_GLOBALS:
            return this.globals;
        }
      }
    }

    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      // すでに、indexesはセットされている
      return this.#getDefinedPropertyValue(target, defindedProperty, receiver);
    } else {
      if (prop[0] === "@") {
        const propName = prop.slice(1);
        const defindedProperty = this.definedPropertyByProp.get(propName);
        if (defindedProperty) {
          return defindedProperty.expand(receiver, []).map(indexes => {
            const value = this[SYM_CALL_DIRECT_GET](propName, indexes, target, receiver);
            return [ value, indexes];
          });
        }
      }
      if (prop[0] !== "_") {
        const {loopProperty, indexes} = this.#getLoopPropertyAndIndexesFromPropertyName(prop);
        if (loopProperty && indexes) {
          return this[SYM_CALL_DIRECT_GET](loopProperty.name, indexes, target, receiver);
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy<ViewModel>} receiver 
   */
  set(target, prop, value, receiver) {
    const defindedProperty = this.definedPropertyByProp.get(prop);
    if (defindedProperty) {
      return this.#setDefinedPropertyValue(target, defindedProperty, value, receiver);
    } else {
      if (prop[0] === "@") {
        const propName = prop.slice(1);
        const defindedProperty = this.definedPropertyByProp.get(propName);
        if (defindedProperty) {
          defindedProperty.expand(receiver, []).forEach(indexes => {
            this[SYM_CALL_DIRECT_SET](propName, indexes, value, target, receiver);
          });
          return true;
        }
      }
      if (prop[0] !== "_") {
        const {loopProperty, indexes} = this.#getLoopPropertyAndIndexesFromPropertyName(prop);
        if (loopProperty && indexes) {
          this[SYM_CALL_DIRECT_SET](loopProperty.name, indexes, value, target, receiver);
          return true;
        }
      }
      Reflect.set(target, prop, value, receiver);
      return true;
    }
  }
};

/**
 * 
 * @param {Component} component
 * @param {ViewModel} origViewModel 
 * @returns {Proxy<ViewModel>}
 */
function create(component, origViewModel) {
  const { viewModel, definedProperties, dependentMap, cachablePropertyNames } = Accessor.convert(component, origViewModel);
  return new Proxy(viewModel, new Handler$1(component, definedProperties, dependentMap, cachablePropertyNames));

}

function getPath(pattern, indexes) {
  let i = 0;
  return pattern.replaceAll("*", () => indexes[i++] ?? "*");
}
  
class Handler {
  /**
   * @type {{key:string,value:any}} 
   */
  #data = {};
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {Map<string,{bindProp:string,bindIndexes:number[]}>}
   */
  #bindPropByThisProp = new Map();

  /**
   * @type {{key:string,value:any}|ViewModel}
   */
  get data() {
    return (this.#component ? this.#component?.parentComponent?.viewModel : this.#data) ?? {};
  }

  /**
   * 
   * @param {{key:string,value:any}|Component} data 
   */
  [SYM_CALL_BIND_DATA](data) {
    if (data instanceof Component) {
      this.#component = data;
    } else {
      this.#data = data;
    }
  }

  /**
   * 
   * @param {string} thisProp 
   * @param {string} bindProp 
   * @param {number[]} bindIndexes 
   */
  [SYM_CALL_BIND_PROPERTY](thisProp, bindProp, bindIndexes) {
    this.#bindPropByThisProp.set(thisProp, { bindProp,  bindIndexes } );
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === SYM_CALL_BIND_DATA) {
      return (data) => Reflect.apply(this[SYM_CALL_BIND_DATA], this, [data]);
    }
    if (prop === SYM_CALL_BIND_PROPERTY) {
      return (thisProp, bindProp, bindIndexes) => Reflect.apply(this[SYM_CALL_BIND_PROPERTY], this, [thisProp, bindProp, bindIndexes]);
    }
    const { data } = this;
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, bindIndexes:[] };
    const bindPath = getPath(bindProp, bindIndexes);
    return Reflect.get(data, bindPath, data);
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
    const { bindProp, bindIndexes } = this.#bindPropByThisProp.get(prop) ?? { bindProp:prop, bindIndexes:[] };
    const bindPath = getPath(bindProp, bindIndexes);
    return Reflect.set(data, bindPath, value, data);
  }
}

/**
 * 
 * @returns {Proxy<Handler>}
 */
function createData() {
  return new Proxy({}, new Handler());
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
    if (node instanceof Component) return node;
    if (node instanceof ShadowRoot) {
      if (node.host instanceof Component) return node.host;
      node = node.host;
    }
  } while(true);
};

/**
 * HTMLの変換
 * {{loop:}}{{if:}}{{else:}}を<template>へ置換
 * {{end:}}を</template>へ置換
 * {{...}}を<!--@@...-->へ置換
 * @param {string} html 
 * @returns {string}
 */
const replaceTag = (html) => {
  const stack = [];
  return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
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
      return `<!--@@${expr}-->`;
    }
  });
};

/**
 * @param {string?} html
 * @param {string?} css
 * @returns {HTMLTemplateElement}
 */
const htmlToTemplate = (html, css) => {
  const template = document.createElement("template");
  template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? replaceTag(html) : "");
  return template;
};

class Component extends HTMLElement {
  /**
   * @type {string}
   * @static
   */
  static html;
  /**
   * @type {HTMLTemplateElement}
   */
  static template;
  /**
   * @type {class}
   * @static
   */
  static ViewModel;
  /**
   * @type {Proxy<ViewModel>}
   */
  viewModel;
  /**
   * @type {View}
   */
  #view;
  /**
   * @type {Binds}
   */
  #binds;
  /**
   * @type {Thread}
   */
  #thread;
  /**
   * @type {UpdateSlot}
   */
  #updateSlot;
  get updateSlot() {
    if (typeof this.#updateSlot === "undefined") {
      this.#updateSlot = UpdateSlot.create(() => {
        this.#updateSlot = undefined;
      }, (updateSlotStatus) => {
        if (updateSlotStatus === UpdateSlotStatus.beginProcess) {
          this.viewModel[SYM_CALL_CLEAR_CACHE]();
        }
        if (updateSlotStatus === UpdateSlotStatus.beginNotify) {
          this.viewModel[SYM_CALL_CLEAR_CACHE]();
        }
      });
      this.#thread.wakeup(this.#updateSlot);
    }
    return this.#updateSlot;
  }
  /**
   * @type {Object<string,any>}
   */
  #data = createData();
  get data() {
    return this.#data;
  }

  constructor() {
    super();
    this.#initialPromise = new Promise((resolve, reject) => {
      this.#initialResolve = resolve;
      this.#initialReject = reject;
    });
  }

  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return [/* 変更を監視する属性名の配列 */];
  }
  
  /**
   * shadowRootを使ってカプセル化をしない(true)
   * @type {boolean}
   */
  get noShadowRoot() {
    return this.hasAttribute("no-shadow-root");
  }

  /**
   * viewのルートとなる要素
   * @type {ShadowRoot|HTMLElement}
   */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  }

  async build() {
    const { template, ViewModel } = this.constructor; // staticから取得
    this.noShadowRoot || this.attachShadow({mode: 'open'});
    this.#thread = new Thread;

    this.#view = new View(template, this.viewRootElement);
    const rawViewModel = Reflect.construct(ViewModel, []);
    this.viewModel = create(this, rawViewModel);
    await this.viewModel[SYM_CALL_INIT]();

    this.updateSlot.addProcess(new ProcessData(async () => {
      this.#binds = this.#view.render(this);
      await this.viewModel[SYM_CALL_CONNECT]();
    }, this, []));
  }

  /**
   * @type {Promise}
   */
  #initialPromise;
  /**
   * @type {() => {}}
   */
  #initialResolve;
  #initialReject;
  get initialPromise() {
    return this.#initialPromise;
  }

  /**
   * @type {Promise}
   */
  #alivePromise;
  /**
   * @type {() => {}}
   */
  #aliveResolve;
  #aliveReject;
  get alivePromise() {
    return this.#alivePromise;
  }

  /**
   * 親コンポーネント
   * @type {Component}
   */
  #parentComponent;
  get parentComponent() {
    if (typeof this.#parentComponent === "undefined") {
      this.#parentComponent = getParentComponent(this);
    }
    return this.#parentComponent;
  }

  bindGlobalData(bindText) {
    const binds = Parser.parse(bindText, "");
    if (binds.length > 0) {
      GlobalData.boundFromComponent(this);
      binds.forEach(({ nodeProperty, viewModelProperty }) => {
        GlobalData.boundPropertyFromComponent(viewModelProperty, this, nodeProperty);
      });
    }
  }
  /**
   * DOMツリーへ追加
   */
  async connectedCallback() {
    try {
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
        this.bindGlobalData(this.dataset.bind ?? "");
      }
      this.#alivePromise = new Promise((resolve, reject) => {
        this.#aliveResolve = resolve;
        this.#aliveReject = reject;
      });
      await this.build();
    } finally {
      this.#initialResolve && this.#initialResolve();
    }
  }

  /**
   * DOMツリーから削除
   */
  disconnectedCallback() {
    this.#aliveResolve && this.#aliveResolve(this.data);
  }

  /**
   * 移動時
   */
  adoptedCallback() {
    
  }

  /**
   * 属性値更新
   * @param {string} name 
   * @param {any} oldValue 
   * @param {any} newValue 
   */
  attributeChangedCallback(name, oldValue, newValue) {
    
  }

  /**
   * 
   * @param {Set<string>} setOfKey 
   * @param {number[]} indexes 
   */
  notify(setOfKey) {
    this.#binds?.updateViewModel(setOfKey);
  }

  /**
   * 
   * @param {string} name 
   * @param {UserComponentData} componentData 
   */
  static regist(name, componentData) {
    const template = htmlToTemplate(componentData.html, componentData.css);
    // 同じクラスを登録できないため
    const componentClass = class extends Component {
      static template = template;
      static ViewModel = componentData.ViewModel;
    };
    // nameにはハイフンが必要、アルファベットの大文字は使えません
    customElements.define(name, componentClass);
  }

}

class Prefix {
  /**
   * @type {string}
   */
  prefix;
  /**
   * @type {string}
   */
  path;

  static prefixes = [];
  static add(prefix, path) {
    this.prefixes.push(Object.assign(new Prefix, {prefix, path}));
  }

  /**
   * 
   * @param {string} tagName 
   * @returns {{prefix:string,path:string}}
   */
  static getByTagName(tagName) {
    const prefix = this.prefixes.find(prefix => {
      const match = prefix.prefix + "-";
      return tagName.startsWith(match);
    });
    return prefix;
  }
}

/**
 * @enum {number}
 */
const ComponentNameType = {
  kebab: 1,
  snake: 2,
  upperCamel: 3,
  lowerCamel: 4,
};

class ComponentNameTypeUtil {
  /**
   * 
   * @param {string} name 
   * @returns {{
   *  [ComponentNameType.kebab]:string,
   *  [ComponentNameType.snake]:string,
   *  [ComponentNameType.upperCamel]:string,
   *  [ComponentNameType.lowerCamel]:string,
   * }}
   */
  static getNames(name) {
    const kebabName = utils$1.toKebabCase(name);
    const snakeName = kebabName.replaceAll("-", "_");
    const upperCamelName = kebabName.split("-").map((text, index) => {
      if (typeof text[0] !== "undefined") {
        text = text[0].toUpperCase() + text.slice(1);
      }
      return text;
    }).join("");
    const lowerCamelName = upperCamelName[0].toLowerCase() + upperCamelName.slice(1);
    return {
      [ComponentNameType.kebab]: kebabName,
      [ComponentNameType.snake]: snakeName,
      [ComponentNameType.upperCamel]: upperCamelName,
      [ComponentNameType.lowerCamel]: lowerCamelName,
    }

  }
}

class Loader {
  static replaceNames = ComponentNameTypeUtil.getNames("component-name")
  /**
   * 
   * @param {string} tagName 
   * @param {ComponentNameType} defaultComponentNameType 
   * @param {string} defaultComponentPath 
   */
  static async load(tagName, defaultComponentNameType, defaultComponentPath) {
    const { replaceNames } = this;
    const registTagName = utils$1.toKebabCase(tagName);
    // タグに一致するプレフィックスを取得する
    const prefixInfo = Prefix.getByTagName(registTagName);
    // プレフィックスがある場合、プレフィックスを除いた部分をコンポーネント名とする
    const componentName = prefixInfo ? registTagName.slice(prefixInfo.prefix.length + 1) : registTagName;
    // タイプ別（スネーク、ケバブ、キャメル）のコンポーネント名を取得する
    const componentNames = ComponentNameTypeUtil.getNames(componentName);
    const prefixPath = prefixInfo?.path ?? defaultComponentPath;
    // パスのパターンをコンポーネント名でリプレース
    let path = prefixPath;
    for(let nameType in ComponentNameType) {
      path = path.replaceAll(`{${replaceNames[nameType]}}`, componentNames[nameType]);
    }
    // リプレースが発生しなければ、デフォルトの方法として、パスの後ろにコンポーネント名.jsを付加する
    if (path === prefixPath) {
      path += ((path.at(-1) !== "/") ? "/" : "") + componentNames[defaultComponentNameType] + ".js";
    }
    // http://～を先方に付加して相対パスを解決する
    const paths = location.pathname.split("/");
    paths[paths.length - 1] = path;
    const fullPath = location.origin + paths.join("/");
    try {
      const componentModule = await import(/* webpackIgnore: true */fullPath);
      Component.regist(registTagName, componentModule.default);
    } catch(e) {
      console.log(`can't load component { registTagName:${registTagName}, fullPath:${fullPath} }`);
      console.error(e);
    }

  }
}

const DEAFULT_PATH = "./";

class Main {
  /**
   * @type {{
   * debug:boolean,
   * defaultComponentNameType:ComponentNameType,
   * defaultComponentPath:string,
   * }}
   */
  static #config = {
    debug: false,
    defaultComponentNameType: ComponentNameType.lowerCamel,
    defaultComponentPath:DEAFULT_PATH,

  };
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
   * @returns {Main}
   */
  static components(components) {
    Object.entries(components).forEach(([name, componentData]) => {
      const componentName = utils$1.toKebabCase(name);
      Component.regist(componentName, componentData);
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
   * @param {Object<string,string>} prefixes
   */
  static prefixes(prefixes) {
    for(let [ prefix, path ] of Object.entries(prefixes)) {
      Prefix.add(prefix, path);
    }
    
    return this;
  }
  /**
   * @param 
   */
  static async load(...tagNames) {
    for(const tagName of tagNames) {
      await Loader.load(tagName, this.#config.defaultComponentNameType, this.#config.defaultComponentPath);
    }
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
   * defaultComponentNameType:ComponentNameType,
   * defaultComponentPath:string,
   * }}  
   * @returns {Main}
   */
  static config({ 
    defaultComponentNameType = ComponentNameType.lowerCamel,
    defaultComponentPath = DEAFULT_PATH,
    debug = false }) {
    this.#config = Object.assign(this.#config, { debug, defaultComponentNameType, defaultComponentPath });
    return this;
  }
  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
}
const defaultPath = DEAFULT_PATH;

export { ComponentNameType, Main as default, defaultPath };
