import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol
} from "./symbols";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";
import { ILoopContext, ILoopIndexes } from "../loopContext/types";
import { IComponent } from "../component/types";
import { IDotNotationHandler } from "../dotNotation/types";
import { createStatePropertyAccessor } from "./createStatePropertyAccessor";

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

type State = { [key:string]: any };

type CallbackParam = {state:State, stateProxy:IStateProxy, handler:IStateHandler & IDotNotationHandler}

const callFuncBySymbol:{ [key: symbol]: (...args: any[]) => any } = {
  [DirectryCallApiSymbol]:
  ({state, stateProxy, handler}:CallbackParam) => 
    async (prop:string, event:Event, loopContext:ILoopContext):Promise<void> => 
      (state[prop] as Function).apply(stateProxy, [event, ...(loopContext?.loopIndexes.values ?? [])])
      ,
  [NotifyForDependentPropsApiSymbol]:
    ({handler}:CallbackParam) => 
      (prop:string, loopIndexes:ILoopIndexes | undefined):void => 
        handler.updator.addUpdatedStateProperty(createStatePropertyAccessor(prop, loopIndexes)),
  [GetDependentPropsApiSymbol]:({handler}:CallbackParam) => ():IDependentProps => handler.dependentProps,
  [ClearCacheApiSymbol]:({handler}:CallbackParam) => ():void => handler.clearCache(),
}

export function getApiMethod(
  state: State, 
  stateProxy: IStateProxy, 
  handler: IStateHandler, 
  prop: symbol
): ((...args: any[]) => any) | undefined {
  return callFuncBySymbol[prop]?.({state, stateProxy, handler});
}
