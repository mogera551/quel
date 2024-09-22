import "jest";
import { createReadonlyState } from "../../src/state/createReadonlyState";
import { IComponentForHandler } from "../../src/state/types";
import { ClearCacheApiSymbol } from "../../src/state/symbols";

describe("createReadonlyState", () => {
  let component: IComponentForHandler;
  beforeEach(() => {
    component = {
      states: {},
      updator: {
        update: jest.fn()
      }
    } as unknown as IComponentForHandler;
  });

  it("should return a readonly proxy", () => {
    const state = {
      prop1: "value1",
      prop2: "value2"
    };
    const readonlyState = createReadonlyState(component, state);

    expect(readonlyState).toBeInstanceOf(Object);
    expect(readonlyState).not.toBe(state);
    expect(readonlyState.prop1).toBe("value1");
    expect(readonlyState.prop2).toBe("value2");
    expect(() => {
      // @ts-ignore
      readonlyState.prop1 = "new value";
    }).toThrow("ReadonlyHandler: set is not allowed");
  });

  it("should return a readonly proxy with nested properties", () => {
    const state = {
      prop1: "value1",
      prop2: {
        prop3: "value3"
      },
      get prop4() {
        return "value4";
      }
    };
    const readonlyState = createReadonlyState(component, state);

    expect(readonlyState.prop2).toBeInstanceOf(Object);
    expect(readonlyState["prop1"]).toBe("value1");
    expect(readonlyState["prop1"]).toBe("value1");
    expect(readonlyState["prop2.prop3"]).toBe("value3");
    expect(readonlyState["prop2.prop3"]).toBe("value3"); // cache read
    expect(readonlyState["prop4"]).toBe("value4");
    expect(readonlyState["prop4"]).toBe("value4"); // cache read
    expect(() => {
      // @ts-ignore
      readonlyState["prop2.prop3"] = "new value";
    }).toThrow("ReadonlyHandler: set is not allowed");
  });

  it("should cache clear", () => {
    const state = {
      prop1: "value1",
      prop2: {
        prop3: "value3"
      },
      get prop4() {
        return "value4";
      }
    };
    const readonlyState = createReadonlyState(component, state);
    expect(readonlyState["prop1"]).toBe("value1");
    expect(readonlyState["prop2.prop3"]).toBe("value3");
    expect(readonlyState["prop4"]).toBe("value4");
    readonlyState[ClearCacheApiSymbol]();
    expect(readonlyState["prop1"]).toBe("value1");
    expect(readonlyState["prop2.prop3"]).toBe("value3");
    expect(readonlyState["prop4"]).toBe("value4");
  });

  it("should return a readonly proxy with array", () => {
    const state = {
      prop1: [1,2,3,4, undefined],
      prop2: ["a", "b", "c"],
      get prop3() {
        return undefined;
      }
    };
    const readonlyState = createReadonlyState(component, state);

    expect(readonlyState["prop1.2"]).toEqual(3);
    expect(readonlyState["prop1.1"]).toEqual(2);
    expect(readonlyState["prop1.2"]).toEqual(3); // cache read
    expect(readonlyState["prop1.1"]).toEqual(2); // cache read
    expect(readonlyState["prop1,4"]).toBeUndefined();
    expect(readonlyState["prop1,4"]).toBeUndefined(); // cache read
    expect(readonlyState["prop2.1"]).toEqual("b");
    expect(readonlyState["prop2.1"]).toEqual("b"); // cache read
    expect(readonlyState["prop3"]).toBeUndefined();
    expect(readonlyState["prop3"]).toBeUndefined(); // cache read
  });
});