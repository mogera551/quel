import "jest";
import { dispatchCustomEvent } from "../../src/state/dispatchCustomEvent";
import { ConnectedEventSymbol, DisconnectedEventSymbol, UpdatedEventSymbol } from "../../src/state/symbols";

describe("dispatchCustomEvent", () => {
  let component: HTMLElement;

  beforeEach(() => {
    component = document.createElement("div");
    jest.spyOn(component, "dispatchEvent");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch a connected event", () => {
    dispatchCustomEvent(component, ConnectedEventSymbol, []);

    expect(component.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "connected",
        detail: {},
      })
    );
  });

  it("should dispatch a disconnected event", () => {
    dispatchCustomEvent(component, DisconnectedEventSymbol, []);

    expect(component.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "disconnected",
        detail: {},
      })
    );
  });

  it("should dispatch an updated event with the correct detail", () => {
    const args = ["prop1", "prop2"];
    dispatchCustomEvent(component, UpdatedEventSymbol, args);

    expect(component.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "updated",
        detail: { props: args },
      })
    );
  });

  it("should raise an error for unknown event symbol", () => {
    const unknownSymbol = Symbol("unknown");

    expect(() => {
      dispatchCustomEvent(component, unknownSymbol, []);
    }).toThrow(`Unknown event symbol: unknown`);
  });

});