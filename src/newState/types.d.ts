import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { IGlobalData } from "../@types/global";
import { IDependentProps } from "../@types/state";
import { INewComponent, INewUpdator } from "../newComponent/types";
import { IDotNotationHandler, IDotNotationProxy } from "../newDotNotation/types";
import { INewLoopContext } from "../newLoopContext/types";

export interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
//  readonly component: INewComponent;
  readonly updator: INewUpdator;
  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void;
  clearCache():void;
  directlyCallback(loopContext:INewLoopContext, callback:() => Promise<void>):Promise<void>;
  addProcess(process:() => Promise<void>, stateProxy:IStateProxy, indexes:number[]):void;
}

export interface IStateProxy extends IDotNotationProxy {
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop:string, loopContext:ILoopContext, event:Event): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, indexes:number[]): void;
  [GetDependentPropsApiSymbol](): IDependentProps;
  [ClearCacheApiSymbol](): void;
  [CreateBufferApiSymbol](component:INewComponent): void;
  [FlushBufferApiSymbol](buffer:{[key:string]:any}, component:INewComponent): boolean;
  // Special Property
  readonly $globals: IGlobalData;
  readonly $dependentProps: Dependencies;
  readonly $component: INewComponent; // todo:後でIUserComponentに変更する

}

export type Dependencies = {
  readonly [key:string]: string[]
}

export interface IDependentProps {
  readonly propsByRefProp: Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  setDependentProps(props:Dependencies):void; //todo:後でprivateに変更する
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

const _SupprotCallbackSymbols = [
  ConnectedCallbackSymbol,
  DisconnectedCallbackSymbol,
  UpdatedCallbackSymbol
] as const;

type SupprotCallbackSymbols = typeof _SupprotCallbackSymbols[number];

const _SupportApiSymbols = [
  DirectryCallApiSymbol,
  NotifyForDependentPropsApiSymbol,
  GetDependentPropsApiSymbol,
  ClearCacheApiSymbol,
  CreateBufferApiSymbol,
  FlushBufferApiSymbol
] as const;

type SupportApiSymbols = typeof _SupportApiSymbols[number];
