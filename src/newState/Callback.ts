import { utils } from "../utils";
import {
  ConnectedCallbackSymbol, DisconnectedCallbackSymbol, UpdatedCallbackSymbol,
  ConnectedEventSymbol, DisconnectedEventSymbol, UpdatedEventSymbol,
} from "../@symbols/state";
import { IStateProxy, IStateHandler, SupprotCallbackSymbols } from "./types";
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

const callbackToEvent:{[key:PropertyKey]:symbol} = {
  [ConnectedCallbackSymbol]: ConnectedEventSymbol,
  [DisconnectedCallbackSymbol]: DisconnectedEventSymbol,
  [UpdatedCallbackSymbol]: UpdatedEventSymbol,
}

type State = {[key:string]:any};

const applyCallback = 
(state:State, stateProxy:IStateProxy, handler:IStateHandler, prop:PropertyKey) => 
(...args:any) => 
async ():Promise<void> => {
  (state[callbackNameBySymbol[prop]])?.apply(stateProxy, args);
  dispatchCustomEvent(handler.component, callbackToEvent[prop], args);
};

export function getCallback(state:State, stateProxy:IStateProxy, handler:IStateHandler, prop:PropertyKey):(()=>any)|undefined {
  return (allCallbacks.has(prop)) ? (
    (prop === ConnectedCallbackSymbol) ? 
      (...args:any) => applyCallback(state, stateProxy, handler, prop)(...args)() : 
      (...args:any) => handler.addProcess(applyCallback(state, stateProxy, handler, prop)(...args), stateProxy, [])
  ) : undefined;
}
