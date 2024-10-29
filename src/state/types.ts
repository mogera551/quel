import { AccessorPropertiesSymbol, ClearCacheApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, GetByPropInfoSymbol, GetDependentPropsApiSymbol, GetDirectSymbol, NotifyForDependentPropsApiSymbol, SetByPropInfoSymbol, SetDirectSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { IPatternInfo } from "../propertyInfo/types";
import { ILoopContext, ILoopIndexes, INamedLoopIndexes, INamedLoopIndexesStack } from "../loopContext/types";
import { IUpdator } from "../updator/types";
import { Indexes, IPropInfo } from "../propertyInfo/types";

export type CleanIndexes = number[];
export type StackIndexes = Indexes[];

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
export type GetExpandValuesFn = (target:object, propInfo:IPropInfo, receiver:object) => any[];
export type SetExpandValuesFn = (target:object, propInfo:IPropInfo, value:any, receiver:object) => any;
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

export interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
  readonly loopContext?: ILoopContext;
  cache?: StateCache;
  readonly getValue: GetValueFn;
  readonly getExpandValues: GetExpandValuesFn;
  readonly setExpandValues: SetExpandValuesFn;
  readonly getValueByPropInfo: GetValueByPropInfoFn;
  readonly setValueByPropInfo: SetValueByPropInfoFn;
  readonly getNamedLoopIndexesStack: GetNamedLoopIndexesStackFn;
  readonly findPropertyCallback: FindPropertyCallbackFn;
  readonly notifyCallback: NotifyCallbackFn;

  get(target:object, prop:PropertyKey, receiver:object):any;
  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean;
  clearCache():void;

}

export type IWritableStateHandler = {
  readonly loopContext?: ILoopContext;
}

export type IReadonlyStateHandler = {
}

export interface IBaseState  {
  readonly $dependentProps?: Dependencies;
}

export interface IStateProxy extends IBaseState {
  [GetDirectSymbol](prop:string, indexes:ILoopIndexes | undefined): any;
  [SetDirectSymbol](prop:string, indexes:ILoopIndexes | undefined, value:any): boolean;
  [GetByPropInfoSymbol](propInfo:IPropInfo): any;
  [SetByPropInfoSymbol](propInfo:IPropInfo, value:any): boolean;
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop: string, event: Event, loopContext: ILoopContext | undefined): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, loopIndexes:ILoopIndexes | undefined): void;
  [GetDependentPropsApiSymbol](): IDependentProps;
  [ClearCacheApiSymbol](): void;
  // Special Property
  readonly $component: IComponent; // todo:後でIUserComponentに変更する
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

export type Dependencies = {
  readonly [key:string]: string[]
}

export interface IDependentProps {
  readonly defaultProps: Set<string>;
  readonly propsByRefProp: {[ key: string ]: Set<string>};
  setDefaultProp(prop:string):void;
}

export type StatePropertyInfo = {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
}

export interface IStates {
  readonly base: Object;
  readonly current: IStateProxy;
  asyncSetWritable(callback: () => Promise<any>): Promise<any>;
  setWritable(callback: () => any): any;
}

export type IComponentForHandler = Pick<IComponent, "states" | "updator" | "template"> & HTMLElement;

export interface IStatePropertyAccessor {
  readonly pattern: string;
  readonly patternInfo: IPatternInfo;
  readonly loopIndexes: ILoopIndexes | undefined;
  readonly key: string;
}