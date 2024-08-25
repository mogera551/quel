import { IComponent } from "../@types/component";
import { ILoopContext } from "../@types/loopContext";
import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol, CreateBufferApiSymbol, FlushBufferApiSymbol
} from "../@symbols/state";
import { IDependentProps, IStateHandler, IStateProxy, SupportApiSymbols } from "./types";
import { PropertyAccess } from "../binding/PropertyAccess";
import { INewLoopContext } from "../newLoopContext/types";

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

const callFuncBySymbol:{[key:PropertyKey]:(...args:any[])=>any} = {
  [DirectryCallApiSymbol]:({state, stateProxy, handler}:{state:Object, stateProxy:IStateProxy, handler:IStateHandler}) => 
    async (prop:string, loopContext:INewLoopContext, event:Event):Promise<void> => 
      handler.directlyCallback(loopContext, async () => 
        Reflect.apply(Reflect.get(state, prop), stateProxy, [event, ...(loopContext?.indexes ?? [])]) as void
      ),
  [NotifyForDependentPropsApiSymbol]:
    ({state, stateProxy, handler}:{state:Object, stateProxy:IStateProxy, handler:IStateHandler}) => 
      (prop:string, indexes:number[]):void => 
        handler.addNotify(state, new PropertyAccess(prop, indexes), stateProxy),
  [GetDependentPropsApiSymbol]:({handler}:{handler:IStateHandler}) => ():IDependentProps => handler.dependentProps,
  [ClearCacheApiSymbol]:({handler}:{handler:IStateHandler}) => ():void => handler.clearCache(),
  [CreateBufferApiSymbol]:({stateProxy}:{stateProxy:IStateProxy}) => (component:IComponent):void => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
  [FlushBufferApiSymbol]:({stateProxy}:{stateProxy:IStateProxy}) => (buffer:{[key:string]:any}, component:IComponent):boolean => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
}

export function getApi(state:Object, stateProxy:IStateProxy, handler:IStateHandler, prop:PropertyKey):(()=>void|undefined) {
  return callFuncBySymbol[prop]?.({state, stateProxy, handler});
}
