import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import { IState } from "../@types/state";
import { utils } from "../utils";
import { getPropInfo } from "./PropInfo";
import { IPropInfo } from "./types";

const getValue = (
  target:object, 
  propInfo:IPropInfo, 
  wildcardIndexes:(number|undefined)[], 
  receiver:object, 
) => (pathIndex:number, wildcardIndex:number):any => {
  const path = propInfo.paths[pathIndex];
  if (path in target) {
    return Reflect.get(target, path, receiver);
  }
  const pattern = propInfo.patternPaths[pathIndex];
  if (path !== pattern) {
    if (pattern in target) {
      return Reflect.get(target, pattern, receiver);
    }
  }
  if (pathIndex === 0) return undefined; 
  const element = propInfo.patternElements[pathIndex];
  const isWildcard = element === "*";
  const parentValue = getValue(target, propInfo, wildcardIndexes, receiver)(pathIndex - 1, wildcardIndex - (isWildcard ? 1 : 0));
  if (isWildcard) {
    return parentValue[wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)];
  } else {
    return parentValue[element];
  }
}


export class Handler implements ProxyHandler<IState> {
  _stackIndexes:(undefined|number)[][] = [];
  get lastStackIndexes():(undefined|number)[] {
    return this._stackIndexes[this._stackIndexes.length - 1] ?? [];
  }
  withIndexes(indexes:(number|undefined)[], callback:()=>void):any {
    this._stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this._stackIndexes.pop();
    }
  }
  
  _get(target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.lastStackIndexes;
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    const _getValue = getValue(target, propInfo, wildcardIndexes, receiver);
    return this.withIndexes(wildcardIndexes, () => {
      return _getValue(propInfo.paths.length - 1, propInfo.wildcardCount - 1);
    });
  }

  _set(target:object, prop:string, value:any, receiver:object):boolean {
    const propInfo = getPropInfo(prop);
    if (propInfo.elements.length === 1) {
      Reflect.set(target, prop, value, receiver);
    } else {
      const lastStackIndexes = this.lastStackIndexes;
      const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
      const _getValue = getValue(target, propInfo, wildcardIndexes, receiver);
      this.withIndexes(wildcardIndexes, () => {
        const lastPatternElement = propInfo.patternElements[propInfo.patternElements.length - 1];
        const lastElement = propInfo.elements[propInfo.elements.length - 1];
        const parentValue = _getValue(propInfo.paths.length - 2, propInfo.wildcardCount - (lastPatternElement === "*" ? 1 : 0) - 1);
        if (lastPatternElement === "*") {
          parentValue[wildcardIndexes[wildcardIndexes.length - 1] ?? utils.raise("wildcard is undefined")] = value;
        } else {
          parentValue[lastElement] = value;
        }
      });
    }
    return true;
  }

  _getExpand(target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.lastStackIndexes;
    const wildcardIndexes = propInfo.wildcardIndexes.map(
      (i, index) => (index === propInfo.lastIncompleteWildcardIndex) ? undefined : (i ?? lastStackIndexes[index])
    );
    console.log(wildcardIndexes, propInfo.wildcardIndexes, lastStackIndexes);
    const index = wildcardIndexes.findIndex(i => typeof i === "undefined");
    const wildcardPath = propInfo.wildcardPaths.at(index) ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    const _getValue = getValue(target, wildcardParentPathInfo, wildcardIndexes, receiver);
    return this.withIndexes(wildcardIndexes, () => {
      const parentValue = _getValue(wildcardParentPathInfo.paths.length - 1, wildcardParentPathInfo.wildcardCount - 1);
      const values = [];
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[index] = i;
        values.push(this.withIndexes(wildcardIndexes, () => {
          return this._get(target, propInfo.pattern, receiver);
        }));
      }
      return values;
    });
  }

  _setExpand(target:object, prop:string, value:any, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.lastStackIndexes;
    const wildcardIndexes = propInfo.wildcardIndexes.map(
      (i, index) => (index === propInfo.lastIncompleteWildcardIndex) ? undefined : (i ?? lastStackIndexes[index])
    );
    const index = wildcardIndexes.findIndex(i => typeof i === "undefined");
    const wildcardPath = propInfo.wildcardPaths.at(index) ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    const _getValue = getValue(target, wildcardParentPathInfo, wildcardIndexes, receiver);
    this.withIndexes(wildcardIndexes, () => {
      const parentValue = _getValue(wildcardParentPathInfo.paths.length - 1, wildcardParentPathInfo.wildcardCount - 1);
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[index] = i;
        this.withIndexes(wildcardIndexes, () => {
          if (Array.isArray(value)) {
            this._set(target, propInfo.pattern, value[i], receiver);
          } else {
            this._set(target, propInfo.pattern, value, receiver);
          }
        });
      }
    });
  }

  _getDirect = (target:object, prop:string, indexes:number[], receiver:object) => {
    return this.withIndexes(indexes, () => {
      return this.get(target, prop, receiver);
    });
  }

  _setDirect = (target:object, prop:string, indexes:number[], value:any, receiver:object):boolean => {
    return this.withIndexes(indexes, () => {
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
        return this.lastStackIndexes[index - 1];
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
