import myname from "./myname.js";
import { Symbols as DotNotationSymbols } from "../modules/dot-notation/dot-notation.js";

/**
 * @enum {Symbol}
 */
export const Symbols = Object.assign({
  isProxy: Symbol.for(`${myname}:arrayHandler.isProxy`),
  getRaw: Symbol.for(`${myname}:arrayHandler.raw`),
  connectedCallback: Symbol.for(`${myname}:viewModel.connectedCallback`),
  disconnectedCallback: Symbol.for(`${myname}:viewModel.disconnectedCallback`),
  initCallback: Symbol.for(`${myname}:viewModel.initCallback`),
  writeCallback: Symbol.for(`${myname}:viewModel.writeCallback`),
  getDependentProps: Symbol.for(`${myname}:viewModel.getDependentProps`),
  getHandler: Symbol.for(`${myname}:viewModel.getHandler`),
  addNotify: Symbol.for(`${myname}:viewModel.addNotify`),

  beCacheable: Symbol.for(`${myname}:viewModel.beCacheable`),
  beUncacheable: Symbol.for(`${myname}:viewModel.beUncacheable`),

  boundByComponent: Symbol.for(`${myname}:globalData.boundByComponent`),

  directlyCall: Symbol.for(`${myname}:viewModel.directCall`),
  bindTo: Symbol.for(`${myname}:componentModule.bindTo`),
  notifyForDependentProps: Symbol.for(`${myname}:viewModel.notifyForDependentProps`),

  bindProperty: Symbol.for(`${myname}:props.bindProperty`),
  toObject: Symbol.for(`${myname}:props.toObject`),

  isComponent: Symbol.for(`${myname}:component.isComponent`),
}, DotNotationSymbols);
