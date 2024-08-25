
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import "../nop";

type PropType = "primitive" | "object" | "array";
type ArrayIncompleteType = "none" | "parital" | "all";

export interface IPropInfo {
  readonly name: string; // The original name
//  type: PropType; // The type of the property
//  incompleteType: ArrayIncompleteType; // The type of the array
  readonly pattern: string; // The pattern 
  readonly elements: string[];
  readonly patternElements: string[];
  readonly paths: string[];
  readonly patternPaths: string[];
  readonly wildcardPaths: string[];
  readonly wildcardCount: number;
  readonly wildcardIndexes: (number|undefined)[];
  readonly lastIncompleteWildcardIndex: number;
}

export interface IDotNotationHandler {
  _stackIndexes: (undefined|number)[][];
  lastStackIndexes: (undefined|number)[];
  withIndexes(indexes:(number|undefined)[], callback:() => any): any;
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
  [key:string]:any;
}