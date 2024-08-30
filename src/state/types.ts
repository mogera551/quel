import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "./symbols";
import { IComponent, IUpdator } from "../component/types";
import { IDotNotationProxy } from "../dotNotation/types";
import { IGlobalDataProxy } from "../global/types";
import { ILoopContext } from "../loopContext/types";

export interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
//  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void;
  clearCache():void;
  directlyCallback(loopContext: ILoopContext | undefined, callback: () => Promise<void>): Promise<void>;
//  addProcess(process:() => Promise<void>, stateProxy:IStateProxy, indexes:number[]):void;
}

export interface IBaseState  {
  readonly $dependentProps: Dependencies;
}

export interface IStateProxy extends IDotNotationProxy, IBaseState {
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop: string, loopContext: ILoopContext | undefined, event: Event): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, indexes:number[]): void;
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
  readonly propsByRefProp: {[ key: string ]: Set<string>};
  setDefaultProp(prop:string):void;
}

export type StateInfo = {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
}

export interface IStates {
  readonly base: Object;
  readonly current: IStateProxy;
  writable(callback: () => Promise<void>): Promise<void>;
}
