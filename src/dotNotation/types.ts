import { GetDirectSymbol, SetDirectSymbol } from "./symbols";

//export type PropType = "primitive" | "object" | "array";
//export type ArrayIncompleteType = "none" | "parital" | "all";

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
  readonly allComplete: boolean;
  readonly allIncomplete: boolean;
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
  stackIndexes: StackIndexes;
  stackNamedWildcardIndexes:NamedWildcardIndexes[];
  lastStackIndexes: Indexes | undefined;
  getLastIndexes: GetLastIndexesFn;
  getValue: GetValueFn;
  getValueWithIndexes: GetValueWithIndexesFn;
  getValueWithoutIndexes: GetValueWithoutIndexesFn;
  setValueWithIndexes: SetValueWithIndexesFn;
  setValueWithoutIndexes: SetValueWithoutIndexesFn;
  getExpandValues: GetExpandValuesFn;
  setExpandValues: SetExpandValuesFn;
  getValueDirect: getValueDirectFn;
  setValueDirect: setValueDirectFn;
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

export type GetValueFn = (
  target:object, 
  patternPaths:string[],
  patternElements:string[],
  wildcardIndexes:(number|undefined)[], 
  pathIndex:number, 
  wildcardIndex:number,
  receiver:object
) => any;

export type GetLastIndexesFn = (pattern:string) =>  Indexes | undefined ;
export type GetValueWithIndexesFn = (target:object, propInfo:IPropInfo, indexes:(number|undefined)[], receiver:object) => any;
export type GetValueWithoutIndexesFn = (target:object, prop:string, receiver:object) => any;
export type WithIndexesFn = (patternInfo: IPatternInfo, indexes:Indexes, callback:() => any) => any; 
export type SetValueWithIndexesFn = (target:object, propInfo:IPropInfo, indexes:(number|undefined)[], value:any, receiver:object) => boolean;
export type SetValueWithoutIndexesFn = (target:object, prop:string, value:any, receiver:object) => boolean;
export type GetExpandValuesFn = (target:object, prop:string, receiver:object) => any[];
export type SetExpandValuesFn = (target:object, prop:string, value:any, receiver:object) => any;
export type getValueDirectFn = (target:object, prop:string, indexes:number[], receiver:object) => any;
export type setValueDirectFn = (target:object, prop:string, indexes:number[], value:any, receiver:object) => boolean;
