
import { PropertyNameInfo } from "./PropertyNameInfo";
import { getPropertyNameInfo } from "./PropertyName";
import { PatternNameInfo } from "./PatternNameInfo";
import { getPatternNameInfo } from "./PatternName";
import { RE_CONTEXT_INDEX, WILDCARD } from "./Const";
import { utils } from "../utils";

const getByPatternNameAndIndexes = (target:any, receiver:any) => (patternName:string, indexes:number[]):any => {
  const value = Reflect.get(target, patternName, receiver);
  if (typeof value !== "undefined") return value;
  const patterNameInfo = getPatternNameInfo(patternName);
  // primitive
  if (patterNameInfo.isPrimitive) return undefined;
  const parent = getByPatternNameAndIndexes(target, receiver)(patterNameInfo.parentPath, indexes);
  if (typeof parent === "undefined") return undefined;
  const lastName = (patterNameInfo.lastPathName === WILDCARD) ? 
    indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
  return parent[lastName];
}

const setByPatternNameAndIndexes = (target:any, receiver:any) => (patternName:string, indexes:number[], value:any):boolean => {
  const patterNameInfo = getPatternNameInfo(patternName);
  if (Reflect.has(target, patternName) || patterNameInfo.isPrimitive) {
    return Reflect.set(target, patternName, value, receiver);
  } else {
    const parent = getByPatternNameAndIndexes(target, receiver)(patterNameInfo.parentPath, indexes);
    if (typeof parent === "undefined") utils.raise(`parent(${patterNameInfo.parentPath}) is undefined`);
    const lastName = (patterNameInfo.lastPathName === WILDCARD) ? 
      indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
    parent[lastName] = value;
    return true;
  }
}

const getValuesAndLevelIndex = (target:any, receiver:any) => 
  (propertyNameInfo:PropertyNameInfo, lastIndexes:number[]):({ values:any[], levelIndex:number, indexes:number[] }) => 
{ 
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
  const values = getByPatternNameAndIndexes(target, receiver)(expandingPatternNameInfo.parentPath, indexes);
  Array.isArray(values) || utils.raise("values is not an array");
  return { values, levelIndex, indexes };
}

const getExpandLastIndex = (target:any, receiver:any) => (propertyName:string, lastIndexes:number[]):any[] => {
  const propertyNameInfo = getPropertyNameInfo(propertyName);
  if (!propertyNameInfo.hasWildcard) utils.raise(`propertyName(${propertyName}) has no wildcard`);
  const { values, levelIndex, indexes } = getValuesAndLevelIndex(target, receiver)(propertyNameInfo, lastIndexes);
  const results = [];
  for(const index in values) {
    indexes[levelIndex] = Number(index);
    results.push(getByPatternNameAndIndexes(target, receiver)(propertyNameInfo.patternName, indexes));
  }
  return results;
}

const setExpandLastIndex = (target:any, receiver:any) => (propertyName:string, lastIndexes:number[], value:(any|any[])):boolean => {
  const propertyNameInfo = getPropertyNameInfo(propertyName);
  if (!propertyNameInfo.hasWildcard) utils.raise(`propertyName(${propertyName}) has no wildcard`);
  const { values, levelIndex, indexes } = getValuesAndLevelIndex(target, receiver)(propertyNameInfo, lastIndexes);
  const setValues = Array.isArray(value) ? value : Array(values.length).fill(value);
  let result = true;
  for(const index in values) {
    indexes[levelIndex] = Number(index);
    result = result && setByPatternNameAndIndexes(target, receiver)(propertyNameInfo.patternName, indexes, setValues[index]);
  }
  return result;
}

export class Handler {
  #stackIndexes:number[][] = [];
  get lastIndexes():number[] {
    return this.#stackIndexes[this.#stackIndexes.length - 1] ?? [];
  }
  get stackIndexes():number[][] {
    return this.#stackIndexes;
  }

  get(target:any, prop:PropertyKey, receiver:any):any {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (!isPropString) break;
      const lastIndexes = this.lastIndexes;
      if (prop[0] === "$") {
        const match = RE_CONTEXT_INDEX.exec(prop);
        if (match) {
          return lastIndexes[Number(match[1]) - 1];
        }
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return getExpandLastIndex(target, receiver)(propertyName, lastIndexes);
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? lastIndexes[i]);
      return getByPatternNameAndIndexes(target, receiver)(propertyNameInfo.patternName, indexes);
    } while(false);
    return Reflect.get(target, prop, receiver);
  }

  set(target:any, prop:PropertyKey, value:any, receiver:any):boolean {
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
        return setExpandLastIndex(target, receiver)(propertyName, lastIndexes, value);
      }
      const propertyNameInfo = getPropertyNameInfo(prop);
      const indexes = propertyNameInfo.indexes.map((index, i) => index ?? lastIndexes[i]);
      return setByPatternNameAndIndexes(target, receiver)(propertyNameInfo.patternName, indexes, value);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }

}
