import { IComponent } from "../component/types";
import { IProxy } from "../dot-notation/types";
import { ILoopContext } from "../loopContext/types";
import { ClearCacheApiSymbol, ConnectedCallbackSymbol, CreateBufferApiSymbol, DirectryCallApiSymbol, DisconnectedCallbackSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "./Const";

export type Dependencies = {
  [key:string]:string[]
}

export type StateClass = typeof Object;

export interface IProxyState {
  [key:PropertyKey]:any,
  // callback
  [ConnectedCallbackSymbol]:() => void,
  [DisconnectedCallbackSymbol]:() => void,
  [UpdatedCallbackSymbol]:() => void,
  // api
  [DirectryCallApiSymbol]:(prop:string, loopContext:ILoopContext, event:Event) => Promise<void>,
  [NotifyForDependentPropsApiSymbol]:(prop:string, indexes:number[]) => void,
  [GetDependentPropsApiSymbol]:() => IDependentProps,
  [ClearCacheApiSymbol]:() => void,
  [CreateBufferApiSymbol]:(component:IComponent) => void,
  [FlushBufferApiSymbol]:(buffer:any, component:IComponent) => void,
  // special property
  $globals:any, // todo: anyを変更
  $dependentProps:Dependencies,
  $component:IComponent,
}

export type IState = IProxy & IProxyState;

export type Proxies = {
  base:IState, write:IState, readonly:IState
}

const _SupprotCallbackSymbols = [
  ConnectedCallbackSymbol,
  DisconnectedCallbackSymbol,
  UpdatedCallbackSymbol
] as const;

export type SupprotCallbackSymbols = typeof _SupprotCallbackSymbols[number];

const _SupportApiSymbols = [
  DirectryCallApiSymbol,
  NotifyForDependentPropsApiSymbol,
  GetDependentPropsApiSymbol,
  ClearCacheApiSymbol,
  CreateBufferApiSymbol,
  FlushBufferApiSymbol
] as const;

export type SupportApiSymbols = typeof _SupportApiSymbols[number];

export interface IDependentProps {
  get propsByRefProp():Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  setDependentProps(props:Dependencies):void;

}

