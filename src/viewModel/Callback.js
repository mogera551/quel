import { Symbols } from "../Symbols.js";
import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";

const WRITE_CALLBACK = "$writeCallback";
const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";

/**
 * @type {Object<symbol,string>}
 */
const callbackNameBySymbol = {
  [Symbols.connectedCallback]: CONNECTED_CALLBACK,
  [Symbols.disconnectedCallback]: DISCONNECTED_CALLBACK,
  [Symbols.writeCallback]: WRITE_CALLBACK,
};

/**
 * @type {Set<symbol>}
 */
const setOfAllCallbacks = new Set([
  Symbols.connectedCallback,
  Symbols.disconnectedCallback,
  Symbols.writeCallback,
]);

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
    const applyCallback = (...args) => async () => Reflect.apply(viewModel[callbackName], viewModelProxy, args);
    if (prop === Symbols.connectedCallback) {
      return (callbackName in viewModel) ? (...args) => applyCallback(...args)() : () => {};
    } else {
      return (callbackName in viewModel) ? (...args) => handler.addProcess(applyCallback(...args), viewModelProxy, []) : () => {};
    }
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
