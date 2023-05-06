import "../types.js";
import { dotNotation } from "../../modules/imports.js";
import { Cache } from "./Cache.js"
import { ViewModelize } from "./ViewModelize.js";
import { Symbols } from "./Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { create as createArrayProxy } from "./ArrayProxy.js";
import { DependentProps } from "./DependentProps.js";

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

/**
 * @type {Set<string>}
 */
const setOfProperties = new Set([
  PROPS_PROPERTY,
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
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
export class ViewModelHandler extends dotNotation.Handler {
  /**
   * @type {import("../component/Component.js").Component}
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
   * 
   * @param {import("../component/Component.js").Component} component
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
//      } else if (propName.name === DEPENDENT_PROPS_PROPERTY) {
      } else {
        return Reflect.get(target, DEPENDENT_PROPS_PROPERTY, receiver);
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
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  #addNotify(target, propertyAccess, receiver) {
    this.#component.updateSlot.addNotify(propertyAccess);
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
      const propName = dotNotation.PropertyName.create(prop);
      value = createArrayProxy(value, () => {
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
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,indexes:number[],event:Event}} param1 
   * @param {Proxy} receiver 
   */
  async #directryCall(target, { propName, indexes, event }, receiver) {
    this.stackIndexes.push(indexes);
    try {
      return await Reflect.apply(target[propName.name], receiver, [event, ...indexes]);
    } finally {
      this.stackIndexes.pop();
    }
  }

  wrapArray(target, {prop, value}, receiver) {
    if (value instanceof Array) {
      const lastIndexes = this.lastIndexes;
      value = createArrayProxy(value, () => {
        let { propName, indexes } = dotNotation.PropertyName.parse(prop);
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
        return async (prop, indexes, event) => 
          this.#directryCall(target, { propName:dotNotation.PropertyName.create(prop), indexes, event }, receiver);
      } else if (prop === Symbols.notifyForDependentProps) {
        return (prop, indexes) => {
          const propertyAccess = { propName:dotNotation.PropertyName.create(prop), indexes };
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
      const value = super.get(target, prop, receiver);
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
    return super.set(target, prop, value, receiver);
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyAccess} propertyAccess
   * @param {string} prop 
   * @param {number[]} indexes 
   * @returns {import("../../modules/dot-notation/dot-notation.js").PropertyAccess[]}
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
      const curPropName = dotNotation.PropertyName.create(prop);
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
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyAccess} propertyAccess
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
 * @param {import("../component/Component.js").Component} component 
 * @param {class<ViewModel>} viewModelClass 
 * @returns {Proxy<ViewModel>}
 */
export function createViewModel(component, viewModelClass) {
  const viewModelInfo = ViewModelize.viewModelize(Reflect.construct(viewModelClass, []));
  const { viewModel, accessorProps, methods } = viewModelInfo;
  return new Proxy(viewModel, new ViewModelHandler(component, accessorProps, methods, viewModel[DEPENDENT_PROPS_PROPERTY]));
}
