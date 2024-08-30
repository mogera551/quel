import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { IDependentProps } from "../newState/types";
import { INewComponent, IUpdator } from "../newComponent/types";
import { IDotNotationHandler, IDotNotationProxy } from "./dotNotation";
import { IGlobalDataProxy } from "./global";
import { ILoopContext } from "./loopContext";

interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
//  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void;
  clearCache():void;
  directlyCallback(loopContext:ILoopContext, callback:() => Promise<void>):Promise<void>;
//  addProcess(process:() => Promise<void>, stateProxy:IStateProxy, indexes:number[]):void;
}

interface IBaseState  {
  readonly $dependentProps: Dependencies;
}

interface IStateProxy extends IDotNotationProxy, IBaseState {
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
  readonly $globals: IGlobalDataProxy;
  readonly $component: INewComponent; // todo:後でIUserComponentに変更する
}

type Dependencies = {
  readonly [key:string]: string[]
}

interface IDependentProps {
  readonly propsByRefProp: Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  setDependentProps(props:Dependencies):void; //todo:後でprivateに変更する
}

type StateInfo = {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
}

interface IStates {
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
