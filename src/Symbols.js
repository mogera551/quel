import { name as myname } from "./myname.js";
import { Symbols as DotNotationSymbols } from "../modules/dot-notation/dot-notation.js";

/**
 * @enum {Symbol}
 */
export const Symbols = Object.assign({
  connectedCallback: Symbol.for(`${myname}:viewModel.connectedCallback`),
  disconnectedCallback: Symbol.for(`${myname}:viewModel.disconnectedCallback`),
  writeCallback: Symbol.for(`${myname}:viewModel.writeCallback`),
  updatedCallback: Symbol.for(`${myname}:viewModel.updatedCallback`),

  connectedEvent: Symbol.for(`${myname}:viewModel.connectedEvent`),
  disconnectedEvent: Symbol.for(`${myname}:viewModel.disconnectedEvent`),
  writeEvent: Symbol.for(`${myname}:viewModel.writeEvent`),
  updatedEvent: Symbol.for(`${myname}:viewModel.updatedEvent`),

  getDependentProps: Symbol.for(`${myname}:viewModel.getDependentProps`),
  clearCache: Symbol.for(`${myname}:viewModel.clearCache`),
  directlyCall: Symbol.for(`${myname}:viewModel.directCall`),
  notifyForDependentProps: Symbol.for(`${myname}:viewModel.notifyForDependentProps`),
  createBuffer: Symbol.for(`${myname}:viewModel.createBuffer`),
  flushBuffer: Symbol.for(`${myname}:viewModel.flushBuffer`),

  boundByComponent: Symbol.for(`${myname}:globalData.boundByComponent`),

  bindTo: Symbol.for(`${myname}:componentModule.bindTo`),

  bindProperty: Symbol.for(`${myname}:props.bindProperty`),
  setBuffer: Symbol.for(`${myname}:props.setBuffer`),
  getBuffer: Symbol.for(`${myname}:props.getBuffer`),
  clearBuffer: Symbol.for(`${myname}:props.clearBuffer`),
  createBuffer: Symbol.for(`${myname}:props.createBuffer`),
  flushBuffer: Symbol.for(`${myname}:props.flushBuffer`),
  toObject: Symbol.for(`${myname}:props.toObject`),
  propInitialize: Symbol.for(`${myname}:props.initialize`),

  isComponent: Symbol.for(`${myname}:component.isComponent`),

  nullSafe: Symbol.for(`${myname}:filter.nullSafe`),
  noNullSafe: Symbol.for(`${myname}:filter.noNullSafe`),
}, DotNotationSymbols);
