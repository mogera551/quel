import "../types.js";
import { Symbols } from "../Symbols.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/**
 * 外部から呼び出されるAPI
 * @type {Set<symbol>}
 */
const setOfApiFunctions = new Set([
  Symbols.directlyCall,
  Symbols.getDependentProps,
  Symbols.notifyForDependentProps,
  Symbols.clearCache,
]);

const callFuncBySymbol = {
  [Symbols.directlyCall]:({viewModel, viewModelProxy, handler}) => async (prop, context, event) => 
    handler.directlyCallback(context, async () => 
      Reflect.apply(viewModel[prop], viewModelProxy, [event, ...context.indexes])
    ),
  [Symbols.notifyForDependentProps]:({viewModel, viewModelProxy, handler}) => (prop, indexes) => 
    handler.addNotify(viewModel, { propName:PropertyName.create(prop), indexes }, viewModelProxy),
  [Symbols.getDependentProps]:({handler}) => () => handler.dependentProps,
  [Symbols.clearCache]:({handler}) => () => handler.cache.clear(),
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