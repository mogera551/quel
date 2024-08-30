import { util } from "../../node_modules/webpack/types";
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import { utils } from "../utils";
import { getPropInfo } from "./PropInfo";
import { IDotNotationHandler, Indexes, IPatternInfo, IPropInfo, IWildcardIndexes, NamedWildcardIndexes, StackIndexes } from "./types";

class WildcardIndexes implements IWildcardIndexes {
  #baseIndexes: Indexes;
  #indexes?: Indexes;
  get indexes(): Indexes {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.#baseIndexes.slice(0, this.wildcardCount);
    }
    return this.#indexes;
  }
  wildcardCount: number;
  pattern: string;
  constructor(pattern: string, wildcardCount: number, indexes: Indexes) {
    this.pattern = pattern;
    this.wildcardCount = wildcardCount;
    this.#baseIndexes = indexes;
    this.#indexes = (wildcardCount === indexes.length) ? indexes : undefined;
  }
}

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
export class Handler implements IDotNotationHandler {
  _stackIndexes: StackIndexes = [];
  _stackNamedWildcardIndexes: NamedWildcardIndexes[] = [];
  get lastStackIndexes(): Indexes | undefined {
    return this._stackIndexes[this._stackIndexes.length - 1];
  }
  getLastIndexes(pattern:string): Indexes | undefined {
    return this._stackNamedWildcardIndexes.at(-1)?.[pattern]?.indexes;
  }
  withIndexes(patternInfo:IPatternInfo, indexes:Indexes, callback:()=>any):any {
    const namedWildcardIndexes: NamedWildcardIndexes = {};
    for(let i = 0; i < patternInfo.wildcardPaths.length; i++) {
      const wildcardPath = patternInfo.wildcardPaths[i];
      namedWildcardIndexes[wildcardPath] = 
        new WildcardIndexes(wildcardPath, i + 1, indexes);
    }
    this._stackNamedWildcardIndexes.push(namedWildcardIndexes);
    this._stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this._stackNamedWildcardIndexes.pop();
      this._stackIndexes.pop();
    }
  }

  _getPropertyValue(target:object, prop:string, receiver:object):any {
    return Reflect.get(target, prop, receiver);
  }

  _getValue(
    target:object, 
    patternPaths:string[],
    patternElements:string[],
    wildcardIndexes:(number|undefined)[], 
    pathIndex:number, wildcardIndex:number,
    receiver:object, 
  ):any {
    const path = patternPaths[pathIndex];
    if (path in target) {
      return this._getPropertyValue(target, path, receiver);
    }
    if (pathIndex === 0) return undefined; 
    const element = patternElements[pathIndex];
    const isWildcard = element === "*";
    const parentValue = this._getValue(
      target, 
      patternPaths,
      patternElements,
      wildcardIndexes, 
      pathIndex - 1, 
      wildcardIndex - (isWildcard ? 1 : 0), 
      receiver);
    const lastIndex = isWildcard ? (wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)) : element;
    return parentValue[lastIndex];
  }

  __get(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], receiver:object) {
    return this.withIndexes(propInfo, indexes, () => {
      return this._getValue(
        target, 
        propInfo.patternPaths,
        propInfo.patternElements, 
        indexes, 
        propInfo.paths.length - 1, 
        propInfo.wildcardCount - 1, 
        receiver);
    });
  }
    
  _get(target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.getLastIndexes(propInfo.wildcardPaths.at(-1) ?? "") ?? [];
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return this.__get(target, propInfo, wildcardIndexes, receiver);
  }

  __set(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], value:any, receiver:object):boolean {
    if (propInfo.paths.length === 1) {
      return Reflect.set(target, propInfo.paths[0], value, receiver);
    }
    this.withIndexes(propInfo, indexes, () => {
      const lastPatternElement = propInfo.patternElements[propInfo.patternElements.length - 1];
      const lastElement = propInfo.elements[propInfo.elements.length - 1];
      const parentValue = this._getValue(
        target, 
        propInfo.patternPaths, 
        propInfo.patternElements,
        indexes, 
        propInfo.paths.length - 2, 
        propInfo.wildcardCount - (lastPatternElement === "*" ? 1 : 0) - 1, 
        receiver);
      if (lastPatternElement === "*") {
        parentValue[indexes[indexes.length - 1] ?? utils.raise("wildcard is undefined")] = value;
      } else {
        parentValue[lastElement] = value;
      }
    });
    return true;
  }

  _set(target:object, prop:string, value:any, receiver:object):boolean {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.getLastIndexes(propInfo.wildcardPaths.at(-1) ?? "") ?? [];
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return this.__set(target, propInfo, wildcardIndexes, value, receiver);
  }

  _getExpand(target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.getLastIndexes(propInfo.wildcardPaths.at(-1) ?? "") ?? [];
    const wildcardIndexes = propInfo.wildcardIndexes.map(
      (i, index) => (index === propInfo.lastIncompleteWildcardIndex) ? undefined : (i ?? lastStackIndexes[index])
    );
    const index = wildcardIndexes.findIndex(i => typeof i === "undefined");
    const wildcardPath = propInfo.wildcardPaths.at(index) ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    return this.withIndexes(propInfo, wildcardIndexes, () => {
      const parentValue = this._getValue(
        target, 
        wildcardParentPathInfo.patternPaths, 
        wildcardParentPathInfo.patternElements,
        wildcardIndexes, 
        wildcardParentPathInfo.paths.length - 1, 
        wildcardParentPathInfo.wildcardCount - 1, 
        receiver);
      if (!Array.isArray(parentValue)) utils.raise(`parent value is not array`);
      const values = [];
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[index] = i;
        values.push(this.withIndexes(propInfo, wildcardIndexes, () => {
          return this._get(target, propInfo.pattern, receiver);
        }));
      }
      return values;
    });
  }

  _setExpand(target:object, prop:string, value:any, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.getLastIndexes(propInfo.wildcardPaths.at(-1) ?? "") ?? [];
    const wildcardIndexes = propInfo.wildcardIndexes.map(
      (i, index) => (index === propInfo.lastIncompleteWildcardIndex) ? undefined : (i ?? lastStackIndexes[index])
    );
    const index = wildcardIndexes.findIndex(i => typeof i === "undefined");
    const wildcardPath = propInfo.wildcardPaths.at(index) ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    this.withIndexes(propInfo, wildcardIndexes, () => {
      const parentValue = this._getValue(
        target, 
        wildcardParentPathInfo.patternPaths, 
        wildcardParentPathInfo.patternElements,
        wildcardIndexes, 
        wildcardParentPathInfo.paths.length - 1, 
        wildcardParentPathInfo.wildcardCount - 1, 
        receiver);
      if (!Array.isArray(parentValue)) utils.raise(`parent value is not array`);
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[index] = i;
        this.withIndexes(propInfo, wildcardIndexes, Array.isArray(value) ? 
          () => this._set(target, propInfo.pattern, value[i], receiver) :
          () => this._set(target, propInfo.pattern, value, receiver));
      }
    });
  }

  _getDirect = (target:object, prop:string, indexes:number[], receiver:object) => {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const pattern = prop[0] === "@" ? prop.slice(1) : prop;
    const propInfo = getPropInfo(pattern);
    return this.withIndexes(propInfo, indexes, () => {
      return this.get(target, prop, receiver);
    });
  }

  _setDirect = (target:object, prop:string, indexes:number[], value:any, receiver:object):boolean => {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const pattern = prop[0] === "@" ? prop.slice(1) : prop;
    const propInfo = getPropInfo(pattern);
    return this.withIndexes(propInfo, indexes, () => {
      return this.set(target, prop, value, receiver);
    });
  }

  get(target:object, prop:PropertyKey, receiver:object):any {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (prop === GetDirectSymbol) {
        return (prop:string, indexes:number[])=>this._getDirect.apply(this, [target, prop, indexes, receiver]);
      }
      if (prop === SetDirectSymbol) {
        return (prop:string, indexes:number[], value:any)=>
          this._setDirect.apply(this, [target, prop, indexes, value, receiver]);
      }
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        return (this.lastStackIndexes ?? [])[index - 1];
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return this._getExpand(target, propertyName, receiver);
      }
      return this._get(target, prop, receiver);
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
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        this._setExpand(target, propertyName, value, receiver);
        return true;
      }
      return this._set(target, prop, value, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }
}
