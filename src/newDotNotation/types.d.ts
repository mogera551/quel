
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import "../nop";

type PropType = "primitive" | "object" | "array";
type ArrayIncompleteType = "none" | "parital" | "all";

export interface IPropInfo {
  name: string; // The original name
//  type: PropType; // The type of the property
//  incompleteType: ArrayIncompleteType; // The type of the array
  pattern:string; // The pattern 
  elements: string[];
  patternElements: string[];
  paths: string[];
  patternPaths: string[];
  wildcardPaths: string[];
  wildcardCount: number;
  wildcardIndexes: (number|undefined)[];
  lastIncompleteWildcardIndex: number;
}

export interface IDotNotationHandler {
  _stackIndexes:(undefined|number)[][] = [];
  get lastStackIndexes():(undefined|number)[];
  withIndexes(indexes:(number|undefined)[], callback:()=>any):any;
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
  _getExpand(target:object, prop:string, receiver:object):any[];
  _setExpand(target:object, prop:string, value:any, receiver:object):any;
  _getDirect(target:object, prop:string, indexes:number[], receiver:object):any;
  _setDirect(target:object, prop:string, indexes:number[], value:any, receiver:object):boolean;
  get(target:object, prop:PropertyKey, receiver:object):any;
  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean;
}

export interface IDotNotationProxy {
  [GetDirectSymbol]:(prop:string, indexes:number[])=>any;
  [SetDirectSymbol]:(prop:string, indexes:number[], value:any)=>boolean;
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
  [key:string]:any;
}