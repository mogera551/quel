import { GetDirectSymbol, SetDirectSymbol } from "./symbols";
import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { GetLastIndexesFn, GetValueFn, GetValueWithIndexesFn, GetValueWithoutIndexesFn, IDotNotationHandler, Indexes, IPatternInfo, IPropInfo, IWildcardIndexes, NamedWildcardIndexes, SetValueWithIndexesFn, SetValueWithoutIndexesFn, StackIndexes, WithIndexesFn } from "./types";
import { getPatternInfo } from "./getPatternInfo";
import { createWildCardIndexes } from "./createWildCardIndexes";
import { getLastIndexes } from "./getLastIndexes";
import { createNamedWildcardIndexes } from "./createNamedWildcardIndexes";
import { withIndexes } from "./withIndexes";
import { getValue } from "./getValue";
import { getValueWithIndexes } from "./getValueWithIndexes";
import { getValueWithoutIndexes } from "./getValueWithoutIndexes";
import { setValueWithIndexes } from "./setValueWithIndexes";
import { setValueWithoutIndexes } from "./setValueWithoutIndexes";

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
export class Handler implements IDotNotationHandler {
  stackIndexes: StackIndexes = [];
  stackNamedWildcardIndexes: NamedWildcardIndexes[] = [];
  get lastStackIndexes(): Indexes | undefined {
    return this.stackIndexes[this.stackIndexes.length - 1];
  }
  getLastIndexes: GetLastIndexesFn = getLastIndexes(this);

  getValue: GetValueFn = getValue(this);

  getValueWithIndexes: GetValueWithIndexesFn = getValueWithIndexes(this);

  getValueWithoutIndexes: GetValueWithoutIndexesFn = getValueWithoutIndexes(this);

  withIndexes: WithIndexesFn = withIndexes(this);

  setValueWithIndexes: SetValueWithIndexesFn = setValueWithIndexes(this);

  setValueWithoutIndexes: SetValueWithoutIndexesFn = setValueWithoutIndexes(this);
    
  _getExpand(target:object, prop:string, receiver:object) {
    // ex.
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0] }
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.1.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.*.bbb.1.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    const propInfo = getPropInfo(prop);
    let lastIndexes = undefined;
    for(let i = propInfo.wildcardPaths.length - 1; i >= 0; i--) {
      const wildcardPath = propInfo.wildcardPaths[i];
      lastIndexes = this.getLastIndexes(wildcardPath);
      if (typeof lastIndexes !== "undefined") break;
    }
    lastIndexes = lastIndexes ?? [];
    let _lastIndex: number | undefined = undefined;
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => {
      if (typeof i === "undefined") {
        _lastIndex = index;
        return lastIndexes[index];
      } else {
        return i;
      }
    });
    const lastIndex = _lastIndex ?? (wildcardIndexes.length - 1);
    const wildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths[wildcardPathInfo.paths.length - 2] ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    return this.withIndexes(
      propInfo, wildcardIndexes, () => {
      const parentValue = this.getValue(
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
        wildcardIndexes[lastIndex] = i;
        values.push(this.withIndexes(
          propInfo, wildcardIndexes, () => {
          return this.getValueWithoutIndexes(target, propInfo.pattern, receiver);
        }));
      }
      return values;
    });
  }

  _setExpand(target:object, prop:string, value:any, receiver:object) {
    const propInfo = getPropInfo(prop);
    let lastIndexes = undefined;
    for(let i = propInfo.wildcardPaths.length - 1; i >= 0; i--) {
      const wildcardPath = propInfo.wildcardPaths[i];
      lastIndexes = this.getLastIndexes(wildcardPath);
      if (typeof lastIndexes !== "undefined") break;
    }
    lastIndexes = lastIndexes ?? [];
    let _lastIndex: number | undefined = undefined;
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => {
      if (typeof i === "undefined") {
        _lastIndex = index;
        return lastIndexes[index];
      } else {
        return i;
      }
    });
    const lastIndex = _lastIndex ?? (wildcardIndexes.length - 1);
    const wildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths[wildcardPathInfo.paths.length - 2] ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    this.withIndexes(
      propInfo, wildcardIndexes, () => {
      const parentValue = this.getValue(
        target, 
        wildcardParentPathInfo.patternPaths, 
        wildcardParentPathInfo.patternElements,
        wildcardIndexes, 
        wildcardParentPathInfo.paths.length - 1, 
        wildcardParentPathInfo.wildcardCount - 1, 
        receiver);
      if (!Array.isArray(parentValue)) utils.raise(`parent value is not array`);
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[lastIndex] = i;
        this.withIndexes(
          propInfo, wildcardIndexes, Array.isArray(value) ? 
          () => this.setValueWithoutIndexes(target, propInfo.pattern, value[i], receiver) :
          () => this.setValueWithoutIndexes(target, propInfo.pattern, value, receiver));
      }
    });
  }

  _getDirect = (target:object, prop:string, indexes:number[], receiver:object) => {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const isIndex = prop[0] === "$";
    const isExpand = prop[0] === "@";
    const propName = isExpand ? prop.slice(1) : prop;
    // パターンではないものも来る可能性がある
    const propInfo = getPropInfo(propName);
    return this.withIndexes(
      propInfo, indexes, () => {
      if (isIndex || isExpand) {
        return this.get(target, prop, receiver);
      } else {
        if (propInfo.allIncomplete) {
          return this.getValue(
            target, 
            propInfo.patternPaths,
            propInfo.patternElements, 
            indexes, 
            propInfo.paths.length - 1, 
            propInfo.wildcardCount - 1, 
            receiver);
        } else {
          return this.getValueWithoutIndexes(target, prop, receiver);
        }
      }
    });
  }

  _setDirect = (target:object, prop:string, indexes:number[], value:any, receiver:object):boolean => {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const isIndex = prop[0] === "$";
    const isExpand = prop[0] === "@";
    const propName = isExpand ? prop.slice(1) : prop;
    // パターンではないものも来る可能性がある
    const propInfo = getPropInfo(propName);
    if (isIndex || isExpand) {
      return this.withIndexes(
        propInfo, indexes, () => {
        return this.set(target, prop, value, receiver);
      });
    } else {
      return this.setValueWithIndexes(target, propInfo, indexes, value, receiver);
    }
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
      return this.getValueWithoutIndexes(target, prop, receiver);
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
      return this.setValueWithoutIndexes(target, prop, value, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }
}
