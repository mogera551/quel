import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol, CreateBufferApiSymbol, FlushBufferApiSymbol
} from "./symbols";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";
import { PropertyAccess } from "../binding/PropertyAccess";
import { ILoopContext } from "../loopContext/types";
import { IComponent } from "../component/types";

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

const callFuncBySymbol:{[key:symbol]:(...args:any[])=>any} = {
  [DirectryCallApiSymbol]:({state, stateProxy, handler}:{state:Object, stateProxy:IStateProxy, handler:IStateHandler}) => 
    async (prop:string, loopContext:ILoopContext, event:Event):Promise<void> => 
      handler.directlyCallback(loopContext, async () => 
        Reflect.apply(Reflect.get(state, prop), stateProxy, [event, ...(loopContext?.indexes ?? [])]) as void
      ),
  [NotifyForDependentPropsApiSymbol]:
    ({handler}:{state:Object, stateProxy:IStateProxy, handler:IStateHandler}) => 
      (prop:string, indexes:number[]):void => 
        handler.updator.addUpdatedStateProperty(new PropertyAccess(prop, indexes)),
  [GetDependentPropsApiSymbol]:({handler}:{handler:IStateHandler}) => ():IDependentProps => handler.dependentProps,
  [ClearCacheApiSymbol]:({handler}:{handler:IStateHandler}) => ():void => handler.clearCache(),
  [CreateBufferApiSymbol]:({stateProxy}:{stateProxy:IStateProxy}) => (component:IComponent):void => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
  [FlushBufferApiSymbol]:({stateProxy}:{stateProxy:IStateProxy}) => (buffer:{[key:string]:any}, component:IComponent):boolean => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
}

export function getApiMethod(state:Object, stateProxy:IStateProxy, handler:IStateHandler, prop:symbol):(()=>void|undefined) {
  return callFuncBySymbol[prop]?.({state, stateProxy, handler});
}
