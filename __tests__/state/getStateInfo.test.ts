import "jest";
import { getStateInfo } from "../../src/state/getStateInfo";
import { getAccessorProperties } from "../../src/state/getAccessorProperties";
import { createDependentProps } from "../../src/state/createDependentProps";
import { IBaseState, StatePropertyInfo } from "../../src/state/types";

jest.mock("../../src/state/getAccessorProperties");
jest.mock("../../src/state/createDependentProps");

describe("getStateInfo", () => {
  const mockState: IBaseState = {
    $dependentProps: {
      prop1: ["value1"],
      prop2: ["value2"]
    }
  };
  const mockState2: IBaseState = {
    $dependentProps: {
      prop1: ["value1"],
      prop2: ["value2"]
    }
  };

  const mockAccessorProperties = ["prop1", "prop2"];
  const mockDependentProps = {
    setDefaultProp: jest.fn(),
    propsByRefProp:{ value1: new Set(["prop1"]), value2: new Set(["prop2"]) }
  };

  beforeEach(() => {
    (getAccessorProperties as jest.Mock).mockReturnValue(mockAccessorProperties);
    (createDependentProps as jest.Mock).mockReturnValue(mockDependentProps);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return cached state property info if available", () => {
    const expectedStatePropertyInfo: StatePropertyInfo = {
      accessorProperties: new Set(mockAccessorProperties),
      dependentProps: mockDependentProps
    };

    // First call to cache the result
    getStateInfo(mockState);

    // Second call should return the cached result
    const result = getStateInfo(mockState);

    expect(result).toEqual(expectedStatePropertyInfo);
    expect(getAccessorProperties).toHaveBeenCalledTimes(1);
    expect(createDependentProps).toHaveBeenCalledTimes(1);
  });

  it("should handle state without dependentProps", () => {
    const stateWithoutDependentProps: IBaseState = {};

    const expectedStatePropertyInfo: StatePropertyInfo = {
      accessorProperties: new Set(mockAccessorProperties),
      dependentProps: {
        propsByRefProp: {},
        setDefaultProp: expect.any(Function)
      }
    };
    (createDependentProps as jest.Mock).mockReturnValue({
      propsByRefProp: {},
      setDefaultProp: expect.any(Function)
    });

    const result = getStateInfo(stateWithoutDependentProps);

    expect(result).toEqual(expectedStatePropertyInfo);
    expect(getAccessorProperties).toHaveBeenCalledWith(stateWithoutDependentProps);
    expect(createDependentProps).toHaveBeenCalledWith({});
  });
});