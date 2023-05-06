import myname from "../myname.js";
import { dotNotation } from "../../modules/imports.js";
const DotNotationSymbols = dotNotation.Symbols;

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
  bindProperty: Symbol.for(`${myname}:componentModule.bindProperty`),
  notifyForDependentProps: Symbol.for(`${myname}:viewModel.notifyForDependentProps`),
}, DotNotationSymbols);
