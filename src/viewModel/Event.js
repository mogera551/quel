import "../types.js";
import { Symbols } from "../Symbols.js";

const CONNECTED_EVENT = "connected";
const DISCONNECTED_EVENT = "disconnected";
const UPDATED_EVENT = "updated";

/** @type {(...args)=>void} */
const createConnectedDetail = (...args) => {};
/** @type {(...args)=>void} */
const createDisconnectedDetail = (...args) => {};
/** @type {(...args)=>void} */
const createUpdatedDetail = (...args) => ({props:args});

/** @type {Object<Symbol,(...args)=>void>} */
const createDetailFn = {
  [Symbols.connectedEvent]: createConnectedDetail,
  [Symbols.disconnectedEvent]: createDisconnectedDetail,
  [Symbols.updatedEvent]: createUpdatedDetail,
};

/** @type {Object<Symbol,string>} */
const customEventNames = {
  [Symbols.connectedEvent]: CONNECTED_EVENT,
  [Symbols.disconnectedEvent]: DISCONNECTED_EVENT,
  [Symbols.updatedEvent]: UPDATED_EVENT,
};

/**
 * 
 * @param {Component} component 
 * @param {Symbol} symbol 
 * @param {any[]} args 
 */
export const dispatchCustomEvent = (component, symbol, args) => {
  const event = new CustomEvent(customEventNames[symbol], {
    detail: createDetailFn[symbol](...args),
  });
  component.dispatchEvent(event);
}