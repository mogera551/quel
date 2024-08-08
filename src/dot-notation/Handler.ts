
import { IPropertyNameInfo, IPatternNameInfo } from "./types";
import { getPropertyNameInfo } from "./PropertyName";
import { getPatternNameInfo } from "./PatternName";
import { GetDirectSymbol, RE_CONTEXT_INDEX, SetDirectSymbol, WILDCARD } from "./Const";
import { utils } from "../utils";
import { State } from "../state/types";

export class Handler implements ProxyHandler<State> {
  #stackIndexes:number[][] = [];
  get lastIndexes():number[] {
    return this.#stackIndexes[this.#stackIndexes.length - 1] ?? [];
  }

  #lastIndexesString:(string|undefined) = undefined;
  get lastIndexesString():string {
    if (typeof this.#lastIndexesString === "undefined") {
      this.#lastIndexesString = this.lastIndexes.join(",");
    }
    return this.#lastIndexesString;
  }

  get stackIndexes():number[][] {
    return this.#stackIndexes;
  }

  pushIndexes(indexes:number[], callback:()=>void):void {
    this.#lastIndexesString = undefined;
    this.#stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this.#stackIndexes.pop(); 
    }
  }

  getByPatternNameAndIndexes(target:State, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any):any {
    const value = Reflect.get(target, patternName, receiver);
    if (typeof value !== "undefined") return value;
    const patterNameInfo = getPatternNameInfo(patternName);
    // primitive
    if (patterNameInfo.isPrimitive) return undefined;
    const parent = this.getByPatternNameAndIndexes(target, {patternName:patterNameInfo.parentPath, indexes}, receiver);
    if (typeof parent === "undefined") return undefined;
    const lastName = (patterNameInfo.lastPathName === WILDCARD) ? 
      indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
    return parent[lastName];
  }
  
  setByPatternNameAndIndexes(target:State, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any):boolean {
    const patterNameInfo = getPatternNameInfo(patternName);
    if (Reflect.has(target, patternName) || patterNameInfo.isPrimitive) {
      return Reflect.set(target, patternName, value, receiver);
    } else {
      const parent = this.getByPatternNameAndIndexes(target, {patternName:patterNameInfo.parentPath, indexes}, receiver);
      if (typeof parent === "undefined") utils.raise(`parent(${patterNameInfo.parentPath}) is undefined`);
      const lastName = (patterNameInfo.lastPathName === WILDCARD) ? 
        indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
      parent[lastName] = value;
      return true;
    }
  }

  getValuesAndLevelIndex (target:State, {propertyNameInfo, lastIndexes}:{propertyNameInfo:IPropertyNameInfo, lastIndexes:number[]}, receiver:any):({ values:any[], levelIndex:number, indexes:number[] }) {
    if (propertyNameInfo.lastIncompleteIndex === -1) utils.raise(`propertyName(${propertyNameInfo.name}) has no wildcard`);
    let levelIndex = -1;
    const indexes = propertyNameInfo.indexes.map((index, i) => { 
      if (i !== propertyNameInfo.lastIncompleteIndex) return index ?? lastIndexes[i] ?? -1;
      levelIndex = i;
      return -1;
    });
    if (levelIndex === -1) utils.raise("propertyName has no wildcard");
    if (indexes.filter(index => index === -1).length > 1) utils.raise(`propertyName(${propertyNameInfo.name}) has many wildcards`);
    const patternNameInfo = getPatternNameInfo(propertyNameInfo.patternName);
    const expandingPatterName = patternNameInfo.wildcardNames[levelIndex];
    const expandingPatternNameInfo = getPatternNameInfo(expandingPatterName);
    const values = this.getByPatternNameAndIndexes(target, {patternName:expandingPatternNameInfo.parentPath, indexes}, receiver)();
    Array.isArray(values) || utils.raise("values is not an array");
    return { values, levelIndex, indexes };
  }
  
  getExpandLastIndex = (target:State, receiver:any) => (propertyName:string, lastIndexes:number[]):any[] => {
    const propertyNameInfo = getPropertyNameInfo(propertyName);
    if (!propertyNameInfo.hasWildcard) utils.raise(`propertyName(${propertyName}) has no wildcard`);
    const { values, levelIndex, indexes } = this.getValuesAndLevelIndex(target, {propertyNameInfo, lastIndexes}, receiver);
    const results = [];
    for(const index in values) {
      indexes[levelIndex] = Number(index);
      results.push(this.getByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes}, receiver));
    }
    return results;
  }
  
  setExpandLastIndex = (target:State, receiver:any) => (propertyName:string, lastIndexes:number[], value:(any|any[])):boolean => {
    const propertyNameInfo = getPropertyNameInfo(propertyName);
    if (!propertyNameInfo.hasWildcard) utils.raise(`propertyName(${propertyName}) has no wildcard`);
    const { values, levelIndex, indexes } = this.getValuesAndLevelIndex(target, {propertyNameInfo, lastIndexes}, receiver);
    const setValues = Array.isArray(value) ? value : Array(values.length).fill(value);
    let result = true;
    for(const index in values) {
      indexes[levelIndex] = Number(index);
      result = result && this.setByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes, value:setValues[index]}, receiver);
    }
    return result;
  }

  getDirect = (target:State, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any) => ():any => {
    return this.pushIndexes(indexes, () => this.getByPatternNameAndIndexes(target, {patternName, indexes}, receiver));
  }

  setDirect(target:State, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any) {
    return this.pushIndexes(indexes, () => this.setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver));
  }

  get(target:State, prop:PropertyKey, receiver:any):any {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (prop === GetDirectSymbol) {
        const fn = Reflect.get(this, "getDirect", receiver);
        return (patternName:string, indexes:number[])=> Reflect.apply(fn, target, [target, {patternName, indexes}, receiver]);
      }
      if (prop === SetDirectSymbol) {
        const fn = Reflect.get(this, "setDirect", receiver);
        return (patternName:string, indexes:number[], value:any)=> Reflect.apply(fn, target, [target, {patternName, indexes, value}, receiver]);
      }
      if (!isPropString) break;
      const lastIndexes = this.lastIndexes;
      if (prop[0] === "$") {
        const match = RE_CONTEXT_INDEX.exec(prop);
        if (match) {
          return lastIndexes[Number(match[1]) - 1];
        }
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return this.getExpandLastIndex(target, receiver)(propertyName, lastIndexes);
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? lastIndexes[i]);
      return this.getByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes}, receiver);
    } while(false);
    return Reflect.get(target, prop, receiver);
  }

  set(target:State, prop:PropertyKey, value:any, receiver:any):boolean {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && prop.startsWith("@@__")) break;
      if (!isPropString) break;
      const lastIndexes = this.lastIndexes;
      if (prop[0] === "$") {
        const match = RE_CONTEXT_INDEX.exec(prop);
        if (match) {
          utils.raise(`context index(${prop}) is read only`);
        }
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return this.setExpandLastIndex(target, receiver)(propertyName, lastIndexes, value);
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? lastIndexes[i]);
      return this.setByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes, value}, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }

}
