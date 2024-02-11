import { name as myname } from "./myname.js";
import { Symbols as DotNotationSymbols } from "../modules/dot-notation/dot-notation.js";

/**
 * @enum {Symbol}
 */
export const Symbols = Object.assign({
  connectedCallback: Symbol.for(`${myname}:viewModel.connectedCallback`),
  disconnectedCallback: Symbol.for(`${myname}:viewModel.disconnectedCallback`),
  writeCallback: Symbol.for(`${myname}:viewModel.writeCallback`),
  getDependentProps: Symbol.for(`${myname}:viewModel.getDependentProps`),
  clearCache: Symbol.for(`${myname}:viewModel.clearCache`),
  directlyCall: Symbol.for(`${myname}:viewModel.directCall`),
  notifyForDependentProps: Symbol.for(`${myname}:viewModel.notifyForDependentProps`),

  boundByComponent: Symbol.for(`${myname}:globalData.boundByComponent`),

  bindTo: Symbol.for(`${myname}:componentModule.bindTo`),

  bindProperty: Symbol.for(`${myname}:props.bindProperty`),
  toObject: Symbol.for(`${myname}:props.toObject`),

  isComponent: Symbol.for(`${myname}:component.isComponent`),
}, DotNotationSymbols);
