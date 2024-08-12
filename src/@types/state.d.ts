import { IPropertyAccess } from "../binding";
import { IComponent } from "./component";
import { IProxy } from "./dotNotation";
import { ILoopContext } from "./loopContext";
import { ClearCacheApiSymbol, ConnectedCallbackSymbol, CreateBufferApiSymbol, DirectryCallApiSymbol, DisconnectedCallbackSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../state/Const";

type Dependencies = {
  [key:string]:string[]
}

type StateClass = typeof Object;

type UpdateItem = [string, number[]];

interface IProxyStatePartial {
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
  [CreateBufferApiSymbol]:(component:IComponent) => {[key:string]:any},
  [FlushBufferApiSymbol]:(buffer:any, component:IComponent) => boolean,
  // special property
  $globals:any, // todo: anyを変更
  $dependentProps:Dependencies,
  $component:IComponent,
}

type IState = IProxy & IProxyStatePartial;

type Proxies = {
  base:Object, write:IState, readonly:IState
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

interface IDependentProps {
  get propsByRefProp():Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  setDependentProps(props:Dependencies):void;
}

interface IDirectlyCallContext {
  get loopContext():ILoopContext;
  callback(loopContext:ILoopContext, directlyCallback:()=>Promise<void>):Promise<void>;
}
