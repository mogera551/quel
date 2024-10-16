import { ILoopIndexes, INamedLoopIndexes, INamedLoopIndexesStack } from "../loopContext/types";
import { IStatePropertyAccessor } from "../state/types";
import { GetAccessorSymbol, GetDirectSymbol, NamedWildcardIndexesDisposeSymbol, SetAccessorSymbol, SetDirectSymbol } from "./symbols";

//export type PropType = "primitive" | "object" | "array";
//export type ArrayIncompleteType = "none" | "parital" | "all";

export interface IPatternInfo {
  /** 
   * ex. aaa.\*.bbb.\*.ccc => ["aaa", "\*", "bbb", "\*", "ccc"]
   */
  readonly patternElements: string[];
  /** 
   * ex. aaa.\*.bbb.\*.ccc => [
   *   "aaa",
   *   "aaa.\*",
   *   "aaa.\*.bbb",
   *   "aaa.\*.bbb.\*",
   *   "aaa.\*.bbb.\*.ccc"
   * ]
   */
  readonly patternPaths: string[];
  /**
   * ex. aaa.\*.bbb.\*.ccc => [
   *   "aaa.\*",
   *   "aaa.\*.bbb.\*"
   * ]
   */
  readonly wildcardPaths: string[];
}

export interface IPropInfo extends IPatternInfo {
  readonly name: string; // The original name
  readonly pattern: string; // The pattern 
  readonly elements: string[];
  readonly paths: string[];
  readonly wildcardLoopIndexes: ILoopIndexes | undefined,
  readonly wildcardNamedLoopIndexes: INamedLoopIndexes;
  readonly wildcardCount: number;
  readonly lastIncompleteWildcardIndex: number;
  readonly allComplete: boolean;
  readonly allIncomplete: boolean;
}

export type Index = number | undefined;
export type Indexes = (undefined|number)[];
export type CleanIndexes = number[];
export type StackIndexes = Indexes[];

export interface IWildcardIndexes {
  indexes: Indexes;
  wildcardCount: number;
  pattern: string;
}

export type NamedWildcardIndexes = Map<string, IWildcardIndexes>;

export interface IDotNotationHandler {
  cache?: StateCache;
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
  getValueDirect: GetValueDirectFn;
  setValueDirect: SetValueDirectFn;
  getValueAccessor: GetValueAccessorFn;
  setValueAccessor: SetValueAccessorFn;

  getValueByPropInfo: GetValueByPropInfoFn;
  setValueByPropInfo: SetValueByPropInfoFn;
  getNamedLoopIndexesStack?: GetNamedLoopIndexesStackFn;

  get(target:object, prop:PropertyKey, receiver:object):any;
  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean;
  clearCache():void;
  findPropertyCallback?: FindPropertyCallbackFn;
  notifyCallback?: NotifyCallbackFn;
}

export interface IDotNotationProxy {
  [GetDirectSymbol](prop:string, indexes:ILoopIndexes | undefined): any;
  [SetDirectSymbol](prop:string, indexes:ILoopIndexes | undefined, value:any): boolean;
  [GetAccessorSymbol](accessor:IStatePropertyAccessor): any;
  [SetAccessorSymbol](accessor:IStatePropertyAccessor, value:any): boolean;
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
  wildcardPaths: string[],
  namedLoopIndexes: INamedLoopIndexes,
  pathIndex:number, 
  wildcardIndex:number,
  receiver:object
) => any;

export type GetLastIndexesFn = (pattern:string) =>  ILoopIndexes | undefined ;
export type GetValueWithIndexesFn = (target:object, propInfo:IPropInfo, loopIndexes:ILoopIndexes | undefined, receiver:object) => any;
export type GetValueWithoutIndexesFn = (target:object, prop:string, receiver:object) => any;
export type WithIndexesFn = (patternInfo: IPatternInfo, loopIndexes:ILoopIndexes | undefined, callback:() => any) => any; 
export type SetValueWithIndexesFn = (target:object, propInfo:IPropInfo, loopIndexes:ILoopIndexes | undefined, value:any, receiver:object) => boolean;
export type SetValueWithoutIndexesFn = (target:object, prop:string, value:any, receiver:object) => boolean;
export type GetExpandValuesFn = (target:object, prop:string, receiver:object) => any[];
export type SetExpandValuesFn = (target:object, prop:string, value:any, receiver:object) => any;
export type GetValueDirectFn = (target:object, prop:string, loopIndexes:ILoopIndexes | undefined, receiver:object) => any;
export type SetValueDirectFn = (target:object, prop:string, loopIndexes:ILoopIndexes | undefined, value:any, receiver:object) => boolean;
export type FindPropertyCallbackFn = (prop: string) => void;
export type NotifyCallbackFn = (pattern:string, loopIndexes:ILoopIndexes | undefined) => void;
export type GetValueAccessorFn = (target:object, accessor:IStatePropertyAccessor, receiver:object) => any;
export type SetValueAccessorFn = (target:object, accessor:IStatePropertyAccessor, value:any, receiver:object) => boolean;

export type GetValueByPropInfoFn = (target:object, propInfo:IPropInfo, receiver:object) => any;
export type SetValueByPropInfoFn = (target:object, propInfo:IPropInfo, value:any, receiver:object) => boolean;

export type GetNamedLoopIndexesStackFn = () => INamedLoopIndexesStack;

export type StateCache = {[key:string]:any};