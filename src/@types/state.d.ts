import { IPropertyAccess } from "../binding";
import { IComponent } from "./component";
import { IProxy } from "./dotNotation";
import { ILoopContext } from "./loopContext";
import { ClearCacheApiSymbol, ConnectedCallbackSymbol, CreateBufferApiSymbol, DirectryCallApiSymbol, DisconnectedCallbackSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../state/Const";

export type Dependencies = {
  [key:string]:string[]
}

export type StateClass = typeof Object;

export type UpdateItem = [string, number[]];

export interface IProxyStatePartial {
  [key:PropertyKey]:any,
  // callback
  [ConnectedCallbackSymbol]:() => Promise<void>,
  [DisconnectedCallbackSymbol]:() => Promise<void>,
  [UpdatedCallbackSymbol]:(updateItems:IPropertyAccess[]) => void,
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

export interface IProxyReadonlyStatePartial {
  // api
  [ClearCacheApiSymbol]:() => void,

}

export type IState = IProxy & IProxyStatePartial;

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

