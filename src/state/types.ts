import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { IDotNotationProxy, IPatternInfo } from "../dotNotation/types";
import { IGlobalDataProxy } from "../global/types";
import { ILoopContext, ILoopIndexes } from "../loopContext/types";
import { IUpdator } from "../updator/types";

export interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
  readonly loopContext?: ILoopContext;
}

export type IWritableStateHandler = {
  readonly loopContext?: ILoopContext;
}

export type IReadonlyStateHandler = {
}

export interface IBaseState  {
  readonly $dependentProps?: Dependencies;
}

export interface IStateProxy extends IDotNotationProxy, IBaseState {
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop: string, event: Event, loopContext: ILoopContext | undefined): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, loopIndexes:ILoopIndexes | undefined): void;
  [GetDependentPropsApiSymbol](): IDependentProps;
  [ClearCacheApiSymbol](): void;
  [CreateBufferApiSymbol](component:IComponent): void;
  [FlushBufferApiSymbol](buffer:{[key:string]:any}, component:IComponent): boolean;
  // Special Property
  readonly $globals: IGlobalDataProxy;
  readonly $component: IComponent; // todo:後でIUserComponentに変更する
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