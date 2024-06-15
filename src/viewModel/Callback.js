import { Symbols } from "../Symbols.js";
import { dispatchCustomEvent } from "./Event.js";
import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";

const WRITE_CALLBACK = "$writeCallback";
const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";
const UPDATED_CALLBACK = "$updatedCallback";

/**
 * @type {Object<symbol,string>}
 */
const callbackNameBySymbol = {
  [Symbols.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols.writeCallback]: WRITE_CALLBACK,
  [Symbols.updatedCallback]: UPDATED_CALLBACK,
};

/**
 * @type {Set<symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols.connectedCallback,
  Symbols.disconnectedCallback,
  Symbols.writeCallback,
  Symbols.updatedCallback,
]);

/** @type {{callback:Symbol,event:Symbol} */
const callbackToEvent = {
  [Symbols.connectedCallback]: Symbols.connectedEvent,
  [Symbols.disconnectedCallback]: Symbols.disconnectedEvent,
  [Symbols.writeCallback]: Symbols.writeEvent,
  [Symbols.updatedCallback]: Symbols.updatedEvent,
}

export class Callback {
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {Proxy<ViewModel>} viewModelProxy 
   * @param {ViewModelHandlerBase} handler
   * @param {symbol} prop
   */
  static get(viewModel, viewModelProxy, handler, prop) {
    const callbackName = callbackNameBySymbol[prop];
    const applyCallback = (...args) => async () => {
      (callbackName in viewModel) && Reflect.apply(viewModel[callbackName], viewModelProxy, args);
      dispatchCustomEvent(handler.component, callbackToEvent[prop], args);
    };
    return (prop === Symbols.connectedCallback) ?
      (...args) => applyCallback(...args)() : 
      (...args) => handler.addProcess(applyCallback(...args), viewModelProxy, []);
  }

  /**
   * 
   * @param {symbol | string} prop 
   * @returns {boolean}
   */
  static has(prop) {
    return setOfAllCallbacks.has(prop);
  }
}
