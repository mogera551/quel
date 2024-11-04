import { AccessorPropertiesSymbol, AsyncSetWritableSymbol, DependenciesSymbol, GetBaseStateSymbol, GetByPropInfoSymbol, SetByPropInfoSymbol, SetWritableSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { ILoopContext, ILoopIndexes, INamedLoopIndexes } from "../loopContext/types";
import { getApiMethod } from "./getApiMethod";
import { getCallbackMethod } from "./getCallbackMethod";
import { getSpecialProps } from "./getSpecialProps";
import { Dependencies, IDependentProps, IStateHandler, IStateProxy, StateCache } from "./types";
import { IUpdator } from "../updator/types";
import { Index, IPropInfo } from "../propertyInfo/types";
import { utils } from "../utils";
import { getPropInfo } from "../propertyInfo/getPropInfo";
import { createLoopIndexesFromArray } from "../loopContext/createLoopIndexes";
import { createStatePropertyAccessor } from "./createStatePropertyAccessor";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createOverrideLoopIndexes } from "../loopContext/createOverrideLoopIndexes";
import { getAccessorProperties } from "./getAccessorProperties";
import { createDependentProps } from "./createDependentProps";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [key:PropertyKey]:any
}

const DEPENDENT_PROPS = "$dependentProps";
type IBaseState = {
  readonly [DEPENDENT_PROPS]?: Dependencies;
  [key: string]: any;
};

type IComponentForHandler = Pick<IComponent, "state" | "updator"> & HTMLElement;

export class Handler implements IStateHandler {
  #component: IComponentForHandler;
  #accessorProperties: Set<string>;
  #dependentProps: IDependentProps;
  #objectBySymbol: ObjectBySymbol;
  #wrirtable: boolean = false;
  #cache: StateCache = {};
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
  get cache(): StateCache {
    return this.#cache;
  }
  set cache(value: StateCache) {
    this.#cache = value;
  }
  get writable(): boolean {
    return this.#wrirtable;
  }

  constructor(component: IComponentForHandler, base: IBaseState) {
    this.#component = component;
    this.#accessorProperties = new Set(getAccessorProperties(base)),
    this.#dependentProps = createDependentProps(base[DEPENDENT_PROPS] ?? {})
    this.#objectBySymbol = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
    this.#getterByType["symbol"] = (target: Object, prop: symbol, receiver: IStateProxy):any => this.#getBySymbol.apply(this, [target, prop, receiver]);
    this.#getterByType["string"] = (target: Object, prop: string, receiver: IStateProxy):any => this.#getByString.apply(this, [target, prop, receiver]);
  }

  getValue(
    target:           object, 
    patternPaths:     string[],
    patternElements:  string[],
    wildcardPaths:    string[],
    namedLoopIndexes: INamedLoopIndexes,
    pathIndex:        number, 
    wildcardIndex:    number,
    receiver:         object
  ): any {
    let value, element, isWildcard, path = patternPaths[pathIndex], cacheKey;
    this.findPropertyCallback(path);
    const wildcardLoopIndexes = namedLoopIndexes.get(wildcardPaths[wildcardIndex]);
    // @ts-ignore
    return (!this.writable) ? 
      (/* use cache */ 
        // @ts-ignore
        value = this.cache[cacheKey = path + ":" + (wildcardLoopIndexes?.toString() ?? "")] ?? (
          /* cache value is null or undefined */
          // @ts-ignore
          (cacheKey in this.cache) ? value : (
            /* no cahce */
            // @ts-ignore
            this.cache[cacheKey] = (
              (value = Reflect.get(target, path, receiver)) ?? (
                (path in target || pathIndex === 0) ? value : (
                  element = patternElements[pathIndex],
                  isWildcard = element === "*",
                  this.getValue(
                    target, 
                    patternPaths,
                    patternElements,
                    wildcardPaths,
                    namedLoopIndexes, 
                    pathIndex - 1, 
                    wildcardIndex - (isWildcard ? 1 : 0), 
                    receiver
                  )[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element]
                )
              )
            )
          )
        )
      ) : (
        /* not use cache */
        (value = Reflect.get(target, path, receiver)) ?? (
          (path in target || pathIndex === 0) ? value : (
            element = patternElements[pathIndex],
            isWildcard = element === "*",
            this.getValue(
              target, 
              patternPaths,
              patternElements,
              wildcardPaths,
              namedLoopIndexes, 
              pathIndex - 1, 
              wildcardIndex - (isWildcard ? 1 : 0), 
              receiver
            )[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element]
          )
        )
      );
  }

  getValueByPropInfo (
    target:   object, 
    propInfo: IPropInfo,
    receiver: object
  ): any {
    let namedLoopIndexes: INamedLoopIndexes;
    if (propInfo.expandable) {
      return this.getExpandValues(target, propInfo, receiver);
    }
    const _getValue = () => this.getValue(
      target, 
      propInfo.patternPaths,
      propInfo.patternElements,
      propInfo.wildcardPaths,
      namedLoopIndexes,
      propInfo.paths.length - 1, 
      propInfo.wildcardCount - 1, 
      receiver 
    );

    const namedLoopIndexesStack = this.updator.namedLoopIndexesStack ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "none") {
      namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      return _getValue();
    } else if (propInfo.wildcardType === "all") {
      namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
    } else {
      const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
      namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
    }
  }

  setValueByPropInfo (
    target:   object, 
    propInfo: IPropInfo,
    value:    any,
    receiver: object
  ): boolean {
    if (!this.writable) utils.raise(`state is readonly`);
    if (propInfo.expandable) {
      return this.setExpandValues(target, propInfo, value, receiver);
    }

    let namedLoopIndexes: INamedLoopIndexes;
    const _setValue = () => {
      try {
        if (propInfo.elements.length === 1) {
          return Reflect.set(target, propInfo.name, value, receiver);
        }
        if (propInfo.pattern in target) {
          return Reflect.set(target, propInfo.pattern, value, receiver);
        }
        const parentPath = propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined");
        const parentPropInfo = getPropInfo(parentPath);
        const parentValue = this.getValue(
          target, 
          parentPropInfo.patternPaths,
          parentPropInfo.patternElements,
          parentPropInfo.wildcardPaths,
          namedLoopIndexes,
          parentPropInfo.paths.length - 1, 
          parentPropInfo.wildcardCount - 1, 
          receiver 
        );
        const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
        const isWildcard = lastElement === "*";
    
        return Reflect.set(
          parentValue, 
          isWildcard ? (
            namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")
          ) : lastElement  , value);
      } finally {
        this.notifyCallback(
          propInfo.pattern, 
          namedLoopIndexes.get(propInfo.wildcardPaths.at(-1) ?? ""));
      }
    };
    const namedLoopIndexesStack = this.updator.namedLoopIndexesStack ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "none") {
      namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      return _setValue();
    } else if (propInfo.wildcardType === "all") {
      namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
    } else {
      const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
      namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
    }
  }
  
  getExpandValues(
    target:   object, 
    propInfo: IPropInfo, 
    receiver: object
  ):any[] {
    // ex.
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0] }
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.1.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.*.bbb.1.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.0.bbb.1.ccc", NG 
    if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
      utils.raise(`wildcard type is invalid`);
    }
    const namedLoopIndexesStack = this.updator.namedLoopIndexesStack ?? utils.raise("getExpandValuesFn: namedLoopIndexesStack is undefined");
    const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getExpandValuesFn: namedLoopIndexes is undefined");
    let indexes: Index[] | undefined;
    let lastIndex = undefined;
    if (propInfo.wildcardType === "context") {
      // 一番後ろの*を展開する
      if (propInfo.wildcardCount > 1) {
        for(let wi = propInfo.wildcardPaths.length - 1; wi >= 0; wi--) {
          if (namedLoopIndexes.has(propInfo.wildcardPaths[wi])) {
            indexes = namedLoopIndexes.get(propInfo.wildcardPaths[wi])?.values;
            break;
          }
        }
        if (typeof indexes === "undefined") {
          utils.raise(`indexes is undefined`);
        }
        if (indexes.length === propInfo.wildcardCount) {
          indexes[indexes.length - 1] = undefined;
        } else if ((indexes.length + 1) === propInfo.wildcardCount) {
          indexes.push(undefined);
        } else {
          utils.raise(`indexes length is invalid`);
        }
        lastIndex = indexes.length - 1;
      } else {
        lastIndex = 0;
        indexes = [ undefined ];
      }
    } else {
      // partialの場合、後ろから*を探す
      let loopIndexes: Index[] = [];
      const values = propInfo.wildcardLoopIndexes?.values ?? [];
      for(let i = values.length - 1; i >= 0; i--) {
        if (typeof lastIndex === "undefined"  && typeof values[i] === "undefined") {
          lastIndex = i;
        }
        if (typeof loopIndexes === "undefined"  && namedLoopIndexes.has(propInfo.wildcardPaths[i])) {
          loopIndexes = namedLoopIndexes.get(propInfo.wildcardPaths[i])?.values ?? utils.raise(`loopIndexes is undefined`);
        }
        if (typeof lastIndex !== "undefined" && typeof loopIndexes !== "undefined") {
          break;
        }
      }
      indexes = [];
      const wildcardIndexes = propInfo.wildcardLoopIndexes?.values ?? utils.raise(`wildcardIndexes is undefined`);
      for(let i = 0; i < propInfo.wildcardCount; i++) {
        if (i === lastIndex) {
          indexes.push(undefined);
        } else {
          indexes.push(wildcardIndexes[i] ?? loopIndexes[i]);
        }
      }
    }
    if (typeof lastIndex === "undefined") {
      utils.raise(`lastIndex is undefined`);
    }
    const expandWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const expandWildcardPathInfo = getPropInfo(expandWildcardPath);
    const expandWildcardParentPath = expandWildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const expandWildcardParentPathInfo = getPropInfo(expandWildcardParentPath);
    const wildcardLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, lastIndex));
    const wildcardAccessor = createStatePropertyAccessor(expandWildcardParentPathInfo.pattern, wildcardLoopIndexes)
    const wildcardNamedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardAccessor);
    const length = this.getValue(
      target,
      expandWildcardParentPathInfo.patternPaths,
      expandWildcardParentPathInfo.patternElements,
      expandWildcardParentPathInfo.wildcardPaths,
      wildcardNamedLoopIndexes,
      expandWildcardParentPathInfo.paths.length - 1,
      expandWildcardParentPathInfo.wildcardCount - 1,
      receiver).length;
    const values = [];
    for(let i = 0; i < length; i++) {
      indexes[lastIndex] = i;
      const LoopIndexes = createLoopIndexesFromArray(indexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, LoopIndexes)
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      const value = namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        return this.getValue(
          target,
          propInfo.patternPaths,
          propInfo.patternElements,
          propInfo.wildcardPaths,
          namedLoopIndexes,
          propInfo.paths.length - 1,
          propInfo.wildcardCount - 1,
          receiver);
      });
      values.push(value);
    }
    return values;
  }

  setExpandValues (
    target: object, 
    propInfo: IPropInfo, 
    value: any, 
    receiver: object
  ): any {
    if (!this.writable) utils.raise(`state is readonly`);
    if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
      utils.raise(`wildcard type is invalid`);
    }
    const namedLoopIndexesStack = this.updator.namedLoopIndexesStack ?? utils.raise("getExpandValuesFn: namedLoopIndexesStack is undefined");
    const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getExpandValuesFn: namedLoopIndexes is undefined");
    let indexes: Index[] | undefined;
    let lastIndex = undefined;
    if (propInfo.wildcardType === "context") {
      // 一番後ろの*を展開する
      lastIndex = (propInfo.wildcardLoopIndexes?.size ?? 0) - 1;
      const lastWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`lastWildcardPath is undefined`);
      indexes = namedLoopIndexes.get(lastWildcardPath)?.values ?? [ undefined ];
      indexes[indexes.length - 1] = undefined;
    } else {
      // partialの場合、後ろから*を探す
      let loopIndexes: Index[] = [];
      const values = propInfo.wildcardLoopIndexes?.values ?? [];
      for(let i = values.length - 1; i >= 0; i--) {
        if (typeof lastIndex === "undefined"  && typeof values[i] === "undefined") {
          lastIndex = i;
        }
        if (typeof loopIndexes === "undefined"  && namedLoopIndexes.has(propInfo.wildcardPaths[i])) {
          loopIndexes = namedLoopIndexes.get(propInfo.wildcardPaths[i])?.values ?? utils.raise(`loopIndexes is undefined`);
        }
        if (typeof lastIndex !== "undefined" && typeof loopIndexes !== "undefined") {
          break;
        }
      }
      indexes = [];
      const wildcardIndexes = propInfo.wildcardLoopIndexes?.values ?? utils.raise(`wildcardIndexes is undefined`);
      for(let i = 0; i < propInfo.wildcardCount; i++) {
        if (i === lastIndex) {
          indexes.push(undefined);
        } else {
          indexes.push(wildcardIndexes[i] ?? loopIndexes[i]);
        }
      }
    }
    if (typeof lastIndex === "undefined") {
      utils.raise(`lastIndex is undefined`);
    }
    const expandWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const expandWildcardPathInfo = getPropInfo(expandWildcardPath);
    const expandWildcardParentPath = expandWildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const expandWildcardParentPathInfo = getPropInfo(expandWildcardParentPath);
    const wildcardLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, lastIndex));
    const wildcardAccessor = createStatePropertyAccessor(expandWildcardParentPathInfo.pattern, wildcardLoopIndexes)
    const wildcardNamedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardAccessor);
    const length = this.getValue(
      target,
      expandWildcardParentPathInfo.patternPaths,
      expandWildcardParentPathInfo.patternElements,
      expandWildcardParentPathInfo.wildcardPaths,
      wildcardNamedLoopIndexes,
      expandWildcardParentPathInfo.paths.length - 1,
      expandWildcardParentPathInfo.wildcardCount - 1,
      receiver).length;

    for(let i = 0; i < length; i++) {
      indexes[lastIndex] = i;
      const parentPropInfo = getPropInfo(propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined"));
      const parentLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, parentPropInfo.wildcardCount - 1));
      const parentAccessor = createStatePropertyAccessor(parentPropInfo.pattern, parentLoopIndexes)
      const parentNamedLoopIndexes = createNamedLoopIndexesFromAccessor(parentAccessor);
      const parentValue = this.getValue(
        target,
        parentPropInfo.patternPaths,
        parentPropInfo.patternElements,
        parentPropInfo.wildcardPaths,
        parentNamedLoopIndexes,
        parentPropInfo.paths.length - 1,
        parentPropInfo.wildcardCount - 1,
        receiver);
      const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
      const isWildcard = lastElement === "*";
      Reflect.set(
        parentValue, 
        isWildcard ? (
          namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")
        ) : lastElement, Array.isArray(value) ? value[i] : value);
      if (this.writable) {
        this.notifyCallback(propInfo.pattern, namedLoopIndexes.get(propInfo.pattern));
      }
    }
  }

  findPropertyCallback(prop:string): void {
    const dependentProps = this.dependentProps;
    if (!dependentProps.defaultProps.has(prop)) {
      dependentProps.setDefaultProp(prop);
    }
  }

  notifyCallback(
    pattern: string,
    loopIndexes: ILoopIndexes | undefined
  ): void {
    this.updator.addUpdatedStateProperty(createStatePropertyAccessor(pattern, loopIndexes));
  }  

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
    this.cache = {};
  }

  setWritable(callbackFn:()=>any): any {
    if (this.writable) utils.raise("States: already writable");
    this.#wrirtable = true;
    try {
      return callbackFn();
    } finally {
      this.#wrirtable = false;
      this.clearCache();
    }
  }

  async asyncSetWritable(callbackFn:()=>Promise<any>): Promise<any> {
    if (this.writable) utils.raise("States: already writable");
    this.#wrirtable = true;
    try {
      return await callbackFn();
    } finally {
      this.#wrirtable = false;
      this.clearCache();
    }
  }

  funcBySymbol: {[key: symbol]: any} = {
    [GetByPropInfoSymbol]: (target:object, receiver: object)=>(propInfo:IPropInfo):any=>this.getValueByPropInfo(target, propInfo, receiver),
    [SetByPropInfoSymbol]: (target:object, receiver: object)=>(propInfo:IPropInfo, value:any):boolean=>this.setValueByPropInfo(target, propInfo, value, receiver),
    [SetWritableSymbol]: (target:object, receiver: object)=>(callbackFn:()=>any):any=>this.setWritable(callbackFn),
    [AsyncSetWritableSymbol]: (target:object, receiver: object)=>(callbackFn:()=>Promise<any>):Promise<any>=>this.asyncSetWritable(callbackFn),
    [GetBaseStateSymbol]: (target:object, receiver: object)=>():object=>target
  };

  get(target:object, prop:any, receiver:object):any {
    const isPropString = typeof prop === "string";
    do {
      const getterValue = this.#getterByType[typeof prop]?.(target, prop, receiver);
      if (typeof getterValue !== "undefined") return getterValue;
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (typeof prop === "symbol") {
        let fn = this.funcBySymbol[prop]?.(target, receiver);
        if (typeof fn !== "undefined") return fn;
      }
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        const namedLoopIndexesStack = this.updator.namedLoopIndexesStack ?? utils.raise("get: namedLoopIndexesStack is undefined");
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
    if (!this.writable) utils.raise(`state is readonly`);
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

export function createStateProxy(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new Handler(component, base)) as IStateProxy;
}