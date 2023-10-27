import "../types.js";
import { utils } from "../utils.js";
import { Cache } from "./Cache.js"
import { ViewModelize } from "./ViewModelize.js";
import { Symbols } from "../Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { DependentProps } from "./DependentProps.js";
import { Handler, PropertyName } from "../../modules/dot-notation/dot-notation.js";

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
])

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
export class ViewModelHandler extends Handler {
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
    this.#dependentProps.setDependentProps(dependentProps ?? {})
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
   * @param {{prop:string,context:ContextInfo,event:Event}} param1 
   * @param {Proxy} receiver 
   */
  async #directlyCall(target, { prop, context, event }, receiver) {
    const propName = PropertyName.create(prop);
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
          this.#directlyCall(target, { prop, context, event }, receiver);
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
 * @param {typeof ViewModel} viewModelClass 
 * @returns {Proxy<ViewModel>}
 */
export function createViewModel(component, viewModelClass) {
  const viewModelInfo = ViewModelize.viewModelize(Reflect.construct(viewModelClass, []));
  const { viewModel, accessorProps, methods } = viewModelInfo;
  return new Proxy(viewModel, new ViewModelHandler(component, accessorProps, methods, viewModel[DEPENDENT_PROPS_PROPERTY]));
}
