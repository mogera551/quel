import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol
} from "./symbols";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";
import { ILoopContext, ILoopIndexes } from "../loopContext/types";
import { createStatePropertyAccessor } from "./createStatePropertyAccessor";

type State = { [key:string]: any };

type CallbackParam = {state:State, stateProxy:IStateProxy, handler:IStateHandler}

const callFuncBySymbol:{ [key: symbol]: (...args: any[]) => any } = {
  [DirectryCallApiSymbol]:
  ({state, stateProxy, handler}:CallbackParam) => 
    async (prop:string, event:Event, loopContext:ILoopContext):Promise<void> => 
      (state[prop] as Function).apply(stateProxy, [event, ...(loopContext?.loopIndexes.values ?? [])])
      ,
  [NotifyForDependentPropsApiSymbol]:
    ({handler}:CallbackParam) => 
      (prop:string, loopIndexes:ILoopIndexes | undefined):void => 
        handler.updater.addUpdatedStateProperty(createStatePropertyAccessor(prop, loopIndexes)),
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
