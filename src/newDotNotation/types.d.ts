
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import "../nop";

type PropType = "primitive" | "object" | "array";
type ArrayIncompleteType = "none" | "parital" | "all";

export interface IPatternInfo {
  readonly patternElements: string[];
  readonly patternPaths: string[];
  readonly wildcardPaths: string[];
}

export interface IPropInfo extends IPatternInfo {
  readonly name: string; // The original name
  readonly pattern: string; // The pattern 
  readonly elements: string[];
  readonly paths: string[];
  readonly wildcardIndexes: (number|undefined)[];
  readonly wildcardCount: number;
  readonly lastIncompleteWildcardIndex: number;
}

export type Indexes = (undefined|number)[];
export type StackIndexes = Indexes[];

export interface IWildcardIndexes {
  indexes: Indexes;
  wildcardCount: number;
  pattern: string;
}

export type NamedWildcardIndexes = {
  [key:string]:IWildcardIndexes;
}

export interface IDotNotationHandler {
  _stackIndexes: StackIndexes;
  _stackNamedWildcardIndexes:NamedWildcardIndexes[];
  lastStackIndexes: Indexes;
  getLastIndexes(pattern: string): Indexes;
  withIndexes(patternInfo:IPatternInfo, indexes:Indexes, callback:() => any): any;
  _getPropertyValue(target:object, prop:string, receiver:object):any;
  _getValue(
    target:object, 
    patternPaths:string[],
    patternElements:string[],
    wildcardIndexes:(number|undefined)[], 
    pathIndex:number, wildcardIndex:number,
    receiver:object, 
  ):any;
  _get(target:object, prop:string, receiver:object):any;
  _set(target:object, prop:string, value:any, receiver:object):boolean;
  __get(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], receiver:object):any;
  __set(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], value:any, receiver:object):boolean;
  _getExpand(target:object, prop:string, receiver:object):any[];
  _setExpand(target:object, prop:string, value:any, receiver:object):any;
  _getDirect(target:object, prop:string, indexes:number[], receiver:object):any;
  _setDirect(target:object, prop:string, indexes:number[], value:any, receiver:object):boolean;
  get(target:object, prop:PropertyKey, receiver:object):any;
  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean;
}

export interface IDotNotationProxy {
  [GetDirectSymbol](prop:string, indexes:number[]): any;
  [SetDirectSymbol](prop:string, indexes:number[], value:any): boolean;
  readonly $1?: number;
  readonly $2?: number;
  readonly $3?: number;
  readonly $4?: number;
  readonly $5?: number;
  readonly $6?: number;
  readonly $7?: number;
  readonly $8?: number;
  readonly $9?: number;
  readonly $10?: number;
  readonly $11?: number;
  readonly $12?: number;
  readonly $13?: number;
  readonly $14?: number;
  readonly $15?: number;
  readonly $16?: number;
  [key:PropertyKey]:any;
}