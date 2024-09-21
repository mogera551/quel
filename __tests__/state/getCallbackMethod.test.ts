import "jest";
import { getCallbackMethod } from "../../src/state/getCallbackMethod";
import { ConnectedCallbackSymbol, ConnectedEventSymbol, DisconnectedCallbackSymbol, DisconnectedEventSymbol, UpdatedCallbackSymbol, UpdatedEventSymbol } from "../../src/state/symbols";
import { IStateProxy, IStateHandler } from "../../src/state/types";
import { dispatchCustomEvent } from "../../src/state/dispatchCustomEvent";

jest.mock("../../src/state/dispatchCustomEvent");

describe("getCallbackMethod", () => {
  let state: { [key: string]: any };
  let stateProxy: IStateProxy;
  let handler: IStateHandler;

  beforeEach(() => {
    state = {};
    stateProxy = {} as IStateProxy;
    handler = { element: {} } as IStateHandler;
  });

  it("should return a function for ConnectedCallbackSymbol", () => {
    state["$connectedCallback"] = jest.fn();
    const callback = getCallbackMethod(state, stateProxy, handler, ConnectedCallbackSymbol);
    expect(typeof callback).toBe("function");
  });

  it("should return a function for DisconnectedCallbackSymbol", () => {
    state["$disconnectedCallback"] = jest.fn();
    const callback = getCallbackMethod(state, stateProxy, handler, DisconnectedCallbackSymbol);
    expect(typeof callback).toBe("function");
  });

  it("should return a function for UpdatedCallbackSymbol", () => {
    state["$updatedCallback"] = jest.fn();
    const callback = getCallbackMethod(state, stateProxy, handler, UpdatedCallbackSymbol);
    expect(typeof callback).toBe("function");
  });

  it("should return undefined for unknown symbol", () => {
    const callback = getCallbackMethod(state, stateProxy, handler, Symbol("unknown"));
    expect(callback).toBeUndefined();
  });

  it("should call the connected callback and dispatch event", async () => {
    const connectedCallback = jest.fn();
    state["$connectedCallback"] = connectedCallback;
    const callback = getCallbackMethod(state, stateProxy, handler, ConnectedCallbackSymbol);
    await callback?.();
    expect(connectedCallback).toHaveBeenCalledWith();
    expect(dispatchCustomEvent).toHaveBeenCalledWith(handler.element, ConnectedEventSymbol, []);
  });

  it("should call the disconnected callback and dispatch event", async () => {
    const disconnectedCallback = jest.fn();
    state["$disconnectedCallback"] = disconnectedCallback;
    const callback = getCallbackMethod(state, stateProxy, handler, DisconnectedCallbackSymbol);
    await callback?.();
    expect(disconnectedCallback).toHaveBeenCalledWith();
    expect(dispatchCustomEvent).toHaveBeenCalledWith(handler.element, DisconnectedEventSymbol, []);
  });

  it("should call the updated callback and dispatch event", async () => {
    const updatedCallback = jest.fn();
    state["$updatedCallback"] = updatedCallback;
    const callback = getCallbackMethod(state, stateProxy, handler, UpdatedCallbackSymbol);
    await callback?.("arg1", "arg2");
    expect(updatedCallback).toHaveBeenCalledWith("arg1", "arg2");
    expect(dispatchCustomEvent).toHaveBeenCalledWith(handler.element, UpdatedEventSymbol, ["arg1", "arg2"]);
  });
});