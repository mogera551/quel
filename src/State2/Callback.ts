//import { Symbols } from "../Symbols.js";
//import { dispatchCustomEvent } from "./Event.js";
//import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";

import { utils } from "../utils";
import {
  ConnectedCallbackSymbol, DisconnectedCallbackSymbol, UpdatedCallbackSymbol,
  ConnectedEventSymbol, DisconnectedEventSymbol, UpdatedEventSymbol,
} from "./Const";
import { dispatchCustomEvent } from "./Event";
import { StateBaseHandler } from "./StateBaseHandler";

const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";
const UPDATED_CALLBACK = "$updatedCallback";

const callbackNameBySymbol = {
  [ConnectedCallbackSymbol]: CONNECTED_CALLBACK,
  [DisconnectedCallbackSymbol]: DISCONNECTED_CALLBACK,
  [UpdatedCallbackSymbol]: UPDATED_CALLBACK,
};

const allCallbacks = new Set([
  ConnectedCallbackSymbol,
  DisconnectedCallbackSymbol,
  UpdatedCallbackSymbol,
]);

const callbackToEvent = {
  [ConnectedCallbackSymbol]: ConnectedEventSymbol,
  [DisconnectedCallbackSymbol]: DisconnectedEventSymbol,
  [UpdatedCallbackSymbol]: UpdatedEventSymbol,
}

export class Callback {
  static get(state:State, stateProxy:State, handler:StateBaseHandler, prop:symbol) {
    const callbackName = callbackNameBySymbol[prop] ?? utils.raise(`Unknown callback symbol: ${prop.description}`);
    const applyCallback = (...args:any) => async () => {
      (callbackName in state) && Reflect.apply(state[callbackName], stateProxy, args);
      dispatchCustomEvent(handler.component, callbackToEvent[prop], args);
    };
    return (prop === ConnectedCallbackSymbol) ?
      (...args:any) => applyCallback(...args)() : 
      (...args:any) => handler.addProcess(applyCallback(...args), stateProxy, []);
  }

  static has(prop:PropertyKey):boolean {
    if (typeof prop === "string" || typeof prop === "number") return false;
    return allCallbacks.has(prop);
  }
}
