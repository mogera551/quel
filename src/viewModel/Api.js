import "../types.js";
import { Symbols } from "../Symbols.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/** @typedef {import("./ViewModelHandlerBase.js").ViewModelHandlerBase} ViewModelHandlerBase */

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";

/**
 * 外部から呼び出されるViewModelのAPI
 * @type {Set<symbol>}
 */
const setOfApiFunctions = new Set([
  Symbols.directlyCall,
  Symbols.getDependentProps,
  Symbols.notifyForDependentProps,
  Symbols.clearCache,
  Symbols.createBuffer,
  Symbols.flushBuffer,
]);

/**
 * @type {Object<symbol,({viewModel:ViewModel,viewModelProxy:Proxy,handler:ViewModelHandlerBase})=>()>}
 */
const callFuncBySymbol = {
  [Symbols.directlyCall]:({viewModel, viewModelProxy, handler}) => async (prop, loopContext, event) => 
    handler.directlyCallback(loopContext, async () => 
      Reflect.apply(viewModel[prop], viewModelProxy, [event, ...(loopContext?.allIndexes ?? [])])
    ),
  [Symbols.notifyForDependentProps]:({viewModel, viewModelProxy, handler}) => (prop, indexes) => 
    handler.addNotify(viewModel, { propName:PropertyName.create(prop), indexes }, viewModelProxy),
  [Symbols.getDependentProps]:({handler}) => () => handler.dependentProps,
  [Symbols.clearCache]:({handler}) => () => handler.cache.clear(),
  [Symbols.createBuffer]:({viewModelProxy}) => (component) => viewModelProxy[CREATE_BUFFER_METHOD]?.apply(viewModelProxy, [component]),
  [Symbols.flushBuffer]:({viewModelProxy}) => (component, buffer) => viewModelProxy[FLUSH_BUFFER_METHOD]?.apply(viewModelProxy, [buffer, component]),
}

export class Api {
  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {Proxy<ViewModel>} viewModelProxy 
   * @param {import("./ViewModelHandlerBase.js").ViewModelHandlerBase} handler
   * @param {symbol} prop
   */
  static get(viewModel, viewModelProxy, handler, prop) {
    return callFuncBySymbol[prop]?.({viewModel, viewModelProxy, handler});
  }

  /**
   * @param {symbol | string} prop
   * @returns {boolean}
   */
  static has(prop) {
    return setOfApiFunctions.has(prop);
  }

}