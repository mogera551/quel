
import { IPropertyNameInfo, IPatternNameInfo, IHandler } from "../@types/dotNotation";
import { getPropertyNameInfo } from "./PropertyName";
import { getPatternNameInfo } from "./PatternName";
import { RE_CONTEXT_INDEX, WILDCARD } from "./Const";
import { utils } from "../utils";
import { IProxy } from "../@types/dotNotation";
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";

export class Handler implements IHandler {
  #stackIndexes:(number[]|undefined)[] = [];
  get lastIndexes():number[]|undefined {
    return this.#stackIndexes[this.#stackIndexes.length - 1] ?? [];
  }

  #lastIndexesString:(string|undefined) = undefined;
  get lastIndexesString():string {
    if (typeof this.#lastIndexesString === "undefined") {
      if (typeof this.lastIndexes === "undefined") utils.raise("lastIndexes is undefined");
      this.#lastIndexesString = this.lastIndexes.join(",");
    }
    return this.#lastIndexesString;
  }

  get stackIndexes():(number[]|undefined)[] {
    return this.#stackIndexes;
  }

  pushIndexes(indexes:number[], callback:()=>any):any {
    this.#lastIndexesString = undefined;
    this.#stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this.#stackIndexes.pop(); 
    }
  }

  getByPatternNameAndIndexes(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:IProxy):any {
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
  
  setByPatternNameAndIndexes(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:IProxy):boolean {
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

  getValuesAndLevelIndex (target:Object, {propertyNameInfo, lastIndexes}:{propertyNameInfo:IPropertyNameInfo, lastIndexes:number[]}, receiver:IProxy):({ values:any[], levelIndex:number, indexes:number[] }) {
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
  
  getExpandLastIndex = (target:Object, receiver:IProxy) => (propertyName:string, lastIndexes:number[]):any[] => {
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
  
  setExpandLastIndex = (target:Object, receiver:IProxy) => (propertyName:string, lastIndexes:number[], value:(any|any[])):boolean => {
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

  getDirect = (target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:IProxy) => ():any => {
    return this.pushIndexes(indexes, () => this.getByPatternNameAndIndexes(target, {patternName, indexes}, receiver));
  }

  setDirect = (target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:IProxy):boolean => {
    return this.pushIndexes(indexes, () => this.setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver));
  }

  get(target:Object, prop:PropertyKey, receiver:IProxy):any {
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
          return (lastIndexes ?? utils.raise("lastIndexes is null"))[Number(match[1]) - 1];
        }
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return this.getExpandLastIndex(target, receiver)(propertyName, lastIndexes ?? utils.raise("lastIndexes is null"));
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? (lastIndexes ?? utils.raise("lastIndexes is null"))[i]);
      return this.getByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes}, receiver);
    } while(false);
    return Reflect.get(target, prop, receiver);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:IProxy):boolean {
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
        return this.setExpandLastIndex(target, receiver)(propertyName, lastIndexes ?? utils.raise("lastIndexes is null"), value);
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? (lastIndexes ?? utils.raise("lastIndexes is null"))[i]);
      return this.setByPatternNameAndIndexes(target, {patternName:propertyNameInfo.patternName, indexes, value}, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }

}
