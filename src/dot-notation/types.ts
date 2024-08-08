import { GetDirectSymbol, SetDirectSymbol } from "./Const";

export interface IPropertyNameInfo {
  name: string; // name property
  isPrimitive: boolean; // true if name don't has dot, wildcard
  isDotted: boolean; // true if name has dot
  hasWildcard: boolean; // true if name has wildcard
  patternName: string; // name with wildcard
  indexes: (number|undefined)[]; // indexes of wildcard
  isIncomplete: boolean; // true if name has wildcard at the end
  lastIncompleteIndex: number; // last index of wildcard
}

export interface IPatternNameInfo {
  name: string; // name property
  pathNames: string[]; // array, from separating name property by dot
  parentPathNames: string[]; // pathNames without last element
  parentPath: string; // join parentPathNames by dot
  parentPaths: string[]; // list of all parent paths
  setOfParentPaths: Set<string>; // set of parentPaths
  lastPathName: string; // last path name
  regexp: RegExp; // regular expression for matching name property
  level: number; // number of wildcard in pathNames
  isPrimitive: boolean; // true if pathNames has only one element
  wildcardNames: string[]; // list of wildcard names
}

export interface IHandler {
  get lastIndexes():number[];
  get lastIndexesString():string;
  get stackIndexes():number[][];
  pushIndexes(indexes:number[], callback:()=>void):void;
  getByPatternNameAndIndexes(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any):any;
  setByPatternNameAndIndexes(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any):boolean;
  getValuesAndLevelIndex (target:Object, {propertyNameInfo, lastIndexes}:{propertyNameInfo:IPropertyNameInfo, lastIndexes:number[]}, receiver:any):{ values:any[], levelIndex:number, indexes:number[] };
  getExpandLastIndex:(target:Object, receiver:any) => (propertyName:string, lastIndexes:number[]) => any[];
  setExpandLastIndex:(target:Object, receiver:any) => (propertyName:string, lastIndexes:number[], value:(any|any[])) => boolean;
  getDirect:(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any) => () => any;
  setDirect:(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any) => void;
  get(target:Object, prop:PropertyKey, receiver:any):any;
  set(target:Object, prop:PropertyKey, value:any, receiver:any):boolean;
}

export interface IProxy {
  [GetDirectSymbol]:(patternName:string, indexes:number[]) => any;
  [SetDirectSymbol]:(patternName:string, indexes:number[], value:any) => boolean;
  $1:number;
  $2:number;
  $3:number;
  $4:number;
  $5:number;
  $6:number;
  $7:number;
  $8:number;
  $9:number;
  $10:number;
  $11:number;
  $12:number;
  $13:number;
  $14:number;
  $15:number;
  $16:number;
}