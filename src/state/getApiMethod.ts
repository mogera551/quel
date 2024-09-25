import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol, CreateBufferApiSymbol, FlushBufferApiSymbol
} from "./symbols";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";
import { createPropertyAccess } from "../binding/createPropertyAccess";
import { ILoopContext } from "../loopContext/types";
import { IComponent } from "../component/types";

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

type State = { [key:string]: any };

type CallbackParam = {state:State, stateProxy:IStateProxy, handler:IStateHandler}

const callFuncBySymbol:{ [key: symbol]: (...args: any[]) => any } = {
  [DirectryCallApiSymbol]:
  ({state, stateProxy, handler}:CallbackParam) => 
    async (prop:string, loopContext:ILoopContext, event:Event):Promise<void> => 
      await handler.directlyCallback(loopContext, async (): Promise<void> => 
        await (state[prop] as Function).apply(stateProxy, [event, ...(loopContext?.indexes ?? [])])
      ),
  [NotifyForDependentPropsApiSymbol]:
    ({handler}:CallbackParam) => 
      (prop:string, indexes:number[]):void => 
        handler.updator.addUpdatedStateProperty(createPropertyAccess(prop, indexes)),
  [GetDependentPropsApiSymbol]:({handler}:CallbackParam) => ():IDependentProps => handler.dependentProps,
  [ClearCacheApiSymbol]:({handler}:CallbackParam) => ():void => handler.clearCache(),
  [CreateBufferApiSymbol]:({stateProxy}:CallbackParam) => (component:IComponent):void => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
  [FlushBufferApiSymbol]:({stateProxy}:CallbackParam) => (buffer:{[key:string]:any}, component:IComponent):boolean => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
}

export function getApiMethod(
  state: State, 
  stateProxy: IStateProxy, 
  handler: IStateHandler, 
  prop: symbol
): ((...args: any[]) => any) | undefined {
  return callFuncBySymbol[prop]?.({state, stateProxy, handler});
}
