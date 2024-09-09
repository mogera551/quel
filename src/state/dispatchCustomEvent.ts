
import { utils } from "../utils";
import { ConnectedEventSymbol, DisconnectedEventSymbol, UpdatedEventSymbol } from "./symbols";

const CONNECTED_EVENT = "connected";
const DISCONNECTED_EVENT = "disconnected";
const UPDATED_EVENT = "updated";

type UpdatedArgs = {
  props:any[];
};

const createConnectedDetail = (...args:any[]):void => {};
const createDisconnectedDetail = (...args:any[]):void => {};
const createUpdatedDetail = (...args:any[]):UpdatedArgs => ({props:args});

const createDetailFn:{[key:symbol]:(...args:any[])=>any} = {
  [ConnectedEventSymbol]: createConnectedDetail,
  [DisconnectedEventSymbol]: createDisconnectedDetail,
  [UpdatedEventSymbol]: createUpdatedDetail,
};

const customEventNames:{[key:symbol]:string} = {
  [ConnectedEventSymbol]: CONNECTED_EVENT,
  [DisconnectedEventSymbol]: DISCONNECTED_EVENT,
  [UpdatedEventSymbol]: UPDATED_EVENT,
};

export function dispatchCustomEvent(component:HTMLElement, symbol:symbol, args:any[]):void {
  const eventName = customEventNames[symbol] ?? utils.raise(`Unknown event symbol: ${symbol.description} `);
  const detailFn = createDetailFn[symbol] ?? utils.raise(`Unknown detail function for event symbol: ${symbol.description}`);
  const detail = detailFn(...args);
  const event = new CustomEvent(eventName, { detail });
  component.dispatchEvent(event);
}