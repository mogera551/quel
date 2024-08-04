//import "../types.js";
//import { Symbols } from "../Symbols.js";
//import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

import { 
  DirectryCallApiSymbol, NotifyForDependentPropsApiSymbol, GetDependentPropsApiSymbol, 
  ClearCacheApiSymbol, CreateBufferApiSymbol, FlushBufferApiSymbol
} from "./Const";
import { StateBaseHandler } from "./StateBaseHandler";

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

const apiFunctions = new Set([
  DirectryCallApiSymbol,
  NotifyForDependentPropsApiSymbol,
  GetDependentPropsApiSymbol,
  ClearCacheApiSymbol,
  CreateBufferApiSymbol,
  FlushBufferApiSymbol,
]);

const callFuncBySymbol = {
  // todo: 色々直す
  [DirectryCallApiSymbol]:({state, stateProxy, handler}:{state:State, stateProxy:State, handler:StateBaseHandler}) => 
    async (prop:string, loopContext:any, event:any) => 
      handler.directlyCallback(loopContext, async () => 
        Reflect.apply(state[prop], stateProxy, [event, ...(loopContext?.allIndexes ?? [])])
      ),
  [NotifyForDependentPropsApiSymbol]:
    ({state, stateProxy, handler}:{state:State, stateProxy:State, handler:StateBaseHandler}) => 
      (prop:string, indexes:number[]) => 
        handler.addNotify(state, { propertyName:prop, indexes }, stateProxy),
  [GetDependentPropsApiSymbol]:({handler}:{handler:StateBaseHandler}) => () => handler.dependencies,
  [ClearCacheApiSymbol]:({handler}:{handler:StateBaseHandler}) => () => handler.clearCache(),
  // todo: componentをHTMLElementからComponentに変更
  [CreateBufferApiSymbol]:({stateProxy}:{stateProxy:State}) => (component:HTMLElement) => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
  // todo: componentをHTMLElementからComponentに変更
  [FlushBufferApiSymbol]:({stateProxy}:{stateProxy:State}) => (buffer:any, component:HTMLElement) => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
}

export class Api {
  static get(state:State, stateProxy:State, handler:StateBaseHandler, prop:symbol) {
    return callFuncBySymbol[prop]?.({state, stateProxy, handler});
  }

  static has(prop:symbol):boolean {
    return apiFunctions.has(prop);
  }

}