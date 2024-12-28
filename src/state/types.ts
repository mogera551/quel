import { AccessorPropertiesSymbol, AsyncSetWritableSymbol, ClearCacheApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, GetBaseStateSymbol, GetByPropInfoSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol, SetByPropInfoSymbol, SetWritableSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { IPatternInfo } from "../propertyInfo/types";
import { ILoopContext, ILoopIndexes, INamedLoopIndexes } from "../loopContext/types";
import { IUpdator } from "../updator/types";
import { Indexes, IPropInfo } from "../propertyInfo/types";

export type CleanIndexes = number[];
export type StackIndexes = Indexes[];

// ToDo: この型は削除する
export type NotifyCallbackFn = (pattern:string, loopIndexes:ILoopIndexes | undefined) => void;

export type StateCache = {[key:string]:any};

export interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
  readonly loopContext?: ILoopContext;
  cache?: StateCache;
  getValue(
    target: object, 
    propInfo: IPropInfo,
    namedLoopIndexes: INamedLoopIndexes,
    receiver: object,
    pathIndex?: number, 
    wildcardIndex?: number
  ): any;
  getValueByPropInfo (
    target: object, 
    propInfo: IPropInfo,
    receiver: object
  ): any;
  setValueByPropInfo (
    target: object, 
    propInfo: IPropInfo,
    value: any,
    receiver: object
  ): boolean;
  getExpandValues(
    target:   object, 
    propInfo: IPropInfo, 
    receiver: object
  ):any[];
  setExpandValues (
    target:   object, 
    propInfo: IPropInfo, 
    value:    any, 
    receiver: object
  ): any;
  findPropertyCallback(prop:string): void;
  notifyCallback(
    pattern:     string,
    loopIndexes: ILoopIndexes | undefined
  ): void;
  get(target:object, prop:PropertyKey, receiver:object):any;
  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean;
  clearCache():void;

}

export type IWritableStateHandler = {
  readonly loopContext?: ILoopContext;
}

export type IReadonlyStateHandler = {
}

export interface IStateProxy {
  [GetByPropInfoSymbol](propInfo:IPropInfo): any;
  [SetByPropInfoSymbol](propInfo:IPropInfo, value:any): boolean;
  [SetWritableSymbol](callbackFn:()=>any): any;
  [AsyncSetWritableSymbol](callbackFn:()=>Promise<any>): Promise<any>;
  [GetBaseStateSymbol]() : Object;
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop: string, event: Event, loopContext: ILoopContext | undefined): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, loopIndexes:ILoopIndexes | undefined): void;
  [GetDependentPropsApiSymbol](): IDependentProps;
  [ClearCacheApiSymbol](): void;
  // Special Property
  readonly $dependentProps?: Dependencies;
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

export type IComponentForHandler = Pick<IComponent, "quelState" | "quelUpdator" | "quelTemplate"> & HTMLElement;

export interface IStatePropertyAccessor {
  readonly pattern: string;
  readonly patternInfo: IPatternInfo;
  readonly loopIndexes: ILoopIndexes | undefined;
  readonly key: string;
}