import {
  ConnectedCallbackSymbol, DisconnectedCallbackSymbol, UpdatedCallbackSymbol,
  ConnectedEventSymbol, DisconnectedEventSymbol, UpdatedEventSymbol,
} from "../@symbols/state";
import { IStateProxy, IStateHandler } from "../@types/state";
import { dispatchCustomEvent } from "./Event";

const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";
const UPDATED_CALLBACK = "$updatedCallback";

const callbackNameBySymbol:{[key:PropertyKey]:string} = {
  [ConnectedCallbackSymbol]: CONNECTED_CALLBACK,
  [DisconnectedCallbackSymbol]: DISCONNECTED_CALLBACK,
  [UpdatedCallbackSymbol]: UPDATED_CALLBACK,
};

const allCallbacks:Set<PropertyKey> = new Set([
  ConnectedCallbackSymbol,
  DisconnectedCallbackSymbol,
  UpdatedCallbackSymbol,
]);

const callbackToEvent:{[key:symbol]:symbol} = {
  [ConnectedCallbackSymbol]: ConnectedEventSymbol,
  [DisconnectedCallbackSymbol]: DisconnectedEventSymbol,
  [UpdatedCallbackSymbol]: UpdatedEventSymbol,
}

type State = {[key:string]:any};

const applyCallback = 
(state:State, stateProxy:IStateProxy, handler:IStateHandler, prop:symbol) => 
(...args:any) => 
async ():Promise<void> => {
  (state[callbackNameBySymbol[prop]])?.apply(stateProxy, args);
  dispatchCustomEvent(handler.element, callbackToEvent[prop], args);
};

export function getCallback(state:State, stateProxy:IStateProxy, handler:IStateHandler, prop:symbol):(()=>any)|undefined {
  return (allCallbacks.has(prop)) ? (
    (prop === ConnectedCallbackSymbol) ? 
      (...args:any) => applyCallback(state, stateProxy, handler, prop)(...args)() : 
      (...args:any) => handler.updator.addProcess(applyCallback(state, stateProxy, handler, prop)(...args), stateProxy, [])
  ) : undefined;
}
