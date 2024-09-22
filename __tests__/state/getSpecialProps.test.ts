import "jest";
import { getSpecialProps, properties } from "../../src/state/getSpecialProps";
import { createUserComponent } from "../../src/component/createUserComponent";
import { IStateHandler, IStateProxy } from "../../src/state/types";
import { IComponent } from "../../src/component/types";

jest.mock("../../src/component/createUserComponent");

describe("getSpecialProps", () => {
  let state: { [key: string]: any };
  let stateProxy: IStateProxy;
  let handler: IStateHandler;
  let prop: string;

  beforeEach(() => {
    state = {};
    stateProxy = {
    } as unknown as IStateProxy;
    handler = {
      element: {
        globals: { someGlobal: "value" },
      } as unknown as IComponent,
      updator: {
        addProcess: jest.fn(),
      },
    } as unknown as IStateHandler;
  });

  it("should return component.globals for $globals property", () => {
    prop = "$globals";

    const result = getSpecialProps(state, stateProxy, handler, prop);

    expect(result).toBe((handler.element as IComponent).globals);
  });

  it("should return state.$dependentProps for $dependentProps property", () => {
    const dependentProps = { someProp: "value" };
    state.$dependentProps = dependentProps;
    prop = "$dependentProps";

    const result = getSpecialProps(state, stateProxy, handler, prop);

    expect(result).toBe(dependentProps);
  });

  it("should return a user component for $component property", () => {
    const userComponent = { someComponent: "value" };
    (createUserComponent as jest.Mock).mockReturnValue(userComponent);
    prop = "$component";

    const result = getSpecialProps(state, stateProxy, handler, prop);

    expect(result).toBe(userComponent);
    expect(createUserComponent).toHaveBeenCalledWith(handler.element);
  });

  it("should return a function for $addProcess property", () => {
    prop = "$addProcess";

    const result = getSpecialProps(state, stateProxy, handler, prop);

    expect(typeof result).toBe("function");

    const processFunc = jest.fn();
    result(processFunc);

    expect(handler.updator.addProcess).toHaveBeenCalledWith(processFunc, stateProxy, []);
  });

  it("should return undefined for unknown property", () => {
    prop = "unknownProp";

    const result = getSpecialProps(state, stateProxy, handler, prop);

    expect(result).toBeUndefined();
  });
});