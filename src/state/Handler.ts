import { AccessorPropertiesSymbol, DependenciesSymbol, GetByPropInfoSymbol, SetByPropInfoSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { ILoopContext } from "../loopContext/types";
import { getApiMethod } from "./getApiMethod";
import { getCallbackMethod } from "./getCallbackMethod";
import { getSpecialProps } from "./getSpecialProps";
import { getStateInfo } from "./getStateInfo";
import { GetExpandValuesFn, GetValueByPropInfoFn, GetValueFn, IBaseState, IDependentProps, IStateHandler, IStateProxy, NotifyCallbackFn, SetExpandValuesFn, SetValueByPropInfoFn, StateCache } from "./types";
import { IUpdator } from "../updator/types";
import { FindPropertyCallbackFn, GetNamedLoopIndexesStackFn } from "./types";
import { findPropertyCallbackFn } from "./findPropertyCallbackFn";
import { getNamedLoopIndexesStackFn } from "./getNamedLoopIndexesStackFn";
import { getValueFn } from "./getValueFn";
import { getExpandValuesFn } from "./getExpandValuesFn";
import { setExpandValuesFn } from "./setExpandVauesFn";
import { getValueByPropInfoFn } from "./getValueByPropInfoFn";
import { setValueByPropInfoFn } from "./setValueByPropInfoFn";
import { IPropInfo } from "../propertyInfo/types";
import { utils } from "../utils";
import { getPropInfo } from "../propertyInfo/getPropInfo";
import { notifyCallbackFn } from "./notifyCallbackFn";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [key:PropertyKey]:any
}

type IComponentForHandler = Pick<IComponent, "states" | "updator"> & HTMLElement;

export class Handler implements IStateHandler {
  #component: IComponentForHandler;
  #accessorProperties: Set<string>;
  #dependentProps: IDependentProps;
  #objectBySymbol: ObjectBySymbol;
  get accessorProperties(): Set<string> {
    return this.#accessorProperties;
  }
  get dependentProps(): IDependentProps {
    return this.#dependentProps;
  }
  get element(): HTMLElement {
    return this.#component;
  }
  get component(): IComponentForHandler {
    return this.#component;
  }
  get updator(): IUpdator {
    return this.component.updator;
  }
  get loopContext(): ILoopContext | undefined {
    return undefined;
  }
  get cache(): StateCache | undefined {
    return undefined;
  }
  set cache(value: StateCache | undefined) {
  }

  constructor(component: IComponentForHandler, base: Object) {
    this.#component = component;
    const { accessorProperties, dependentProps } = getStateInfo(base as IBaseState);
    this.#accessorProperties = accessorProperties;
    this.#dependentProps = dependentProps;
    this.#objectBySymbol = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
    this.#getterByType["symbol"] = (target: Object, prop: symbol, receiver: IStateProxy):any => this.#getBySymbol.apply(this, [target, prop, receiver]);
    this.#getterByType["string"] = (target: Object, prop: string, receiver: IStateProxy):any => this.#getByString.apply(this, [target, prop, receiver]);
  }

  getValue: GetValueFn = getValueFn(this);
  getExpandValues: GetExpandValuesFn = getExpandValuesFn(this);
  setExpandValues: SetExpandValuesFn = setExpandValuesFn(this);
  getValueByPropInfo: GetValueByPropInfoFn = getValueByPropInfoFn(this);
  setValueByPropInfo: SetValueByPropInfoFn = setValueByPropInfoFn(this);
  findPropertyCallback: FindPropertyCallbackFn = findPropertyCallbackFn(this);
  getNamedLoopIndexesStack: GetNamedLoopIndexesStackFn = getNamedLoopIndexesStackFn(this);
  notifyCallback: NotifyCallbackFn = notifyCallbackFn(this);

  #getBySymbol(
    target: Object, 
    prop: symbol, 
    receiver: IStateProxy
  ): any {
    return this.#objectBySymbol[prop] ?? 
      getCallbackMethod(target, receiver, this, prop) ?? 
      getApiMethod(target, receiver, this, prop) ?? 
      undefined;
  }

  #getByString(
    target: Object, 
    prop: string, 
    receiver: IStateProxy
  ): any {
    return getSpecialProps(target, receiver, this, prop) ?? undefined;
  }

  #getterByType:{[key: string]: (...args: any) => any} = {};

  clearCache() {
    if (typeof this.cache !== "undefined") {
      this.cache = {};
    }
  }

  get(target:object, prop:any, receiver:object):any {
    const isPropString = typeof prop === "string";
    do {
      const getterValue = this.#getterByType[typeof prop]?.(target, prop, receiver);
      if (typeof getterValue !== "undefined") return getterValue;
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (prop === GetByPropInfoSymbol) {
        return (propInfo:IPropInfo):any=>this.getValueByPropInfo(target, propInfo, receiver);
      }
      if (prop === SetByPropInfoSymbol) {
        return (propInfo:IPropInfo, value:any):boolean=>this.setValueByPropInfo(target, propInfo, value, receiver);
      }
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        const namedLoopIndexesStack = this.getNamedLoopIndexesStack?.() ?? utils.raise("get: namedLoopIndexesStack is undefined");
        const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("get: namedLoopIndexes is undefined");
        const tmpNamedLoopIndexes = Array.from(namedLoopIndexes.values()).filter(v => v.size === index);
        if (tmpNamedLoopIndexes.length !== 1) {
          utils.raise(`context index(${prop}) is ambiguous or null`);
        }
        return tmpNamedLoopIndexes[0].value;
      }
      const propInfo = getPropInfo(prop);
      return this.getValueByPropInfo(target, propInfo, receiver);
    } while(false);
    return Reflect.get(target, prop, receiver);
  }

  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && prop.startsWith("@@__")) break;
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        utils.raise(`context index(${prop}) is read only`);
      }
      const propInfo = getPropInfo(prop);
      return this.setValueByPropInfo(target, propInfo, value, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }

}