import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { IGlobalData } from "../@types/global";
import { IDependentProps } from "../@types/state";
import { IDotNotationHandler, IDotNotationProxy } from "../newDotNotation/types";

export interface IStateHandler {
  get accessorProperties():Set<string>;
  get dependentProps():IDependentProps;
  get component():IComponent;
  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void;
  clearCache():void;
  directlyCallback(loopContext:ILoopContext, callback:() => void):void;
  addProcess(process:() => Promise<void>, stateProxy:IStateProxy, indexes:number[]):void;
}

interface IStateProxyPartial {
  [AccessorPropertiesSymbol]:Set<string>;
  [DependenciesSymbol]:IDependentProps;
  // API
  [DirectryCallApiSymbol]:(prop:string, loopContext:ILoopContext, event:Event) => romise<void>;
  [NotifyForDependentPropsApiSymbol]:(prop:string, indexes:number[]) => void;
  [GetDependentPropsApiSymbol]:() => IDependentProps;
  [ClearCacheApiSymbol]:() => void;
  [CreateBufferApiSymbol]:(component:IComponent) => void;
  [FlushBufferApiSymbol]:(buffer:{[key:string]:any}, component:IComponent) => boolean;
  // Special Property
  $globals:IGlobalData;
  $dependentProps:Dependencies;
  $component:IComponent; // todo:後でIUserComponentに変更する

}
export type IStateProxy = IDotNotationProxy & IStateProxyPartial;

export type Dependencies = {
  [key:string]:string[]
}

export interface IDependentProps {
  get propsByRefProp():Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  setDependentProps(props:Dependencies):void; //todo:後でprivateに変更する
}

export type StateInfo = {
  accessorProperties: Set<string>;
  dependentProps: IDependentProps;
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
