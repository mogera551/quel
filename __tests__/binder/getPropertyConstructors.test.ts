import "jest";
import { getPropertyConstructors } from "../../src/binder/getPropertyConstructors";
import { getNodePropertyConstructor } from "../../src/binder/getNodePropertyConstructor";
import { getStatePropertyConstructor } from "../../src/binder/getStatePropertyConstructor";
import { PropertyConstructors } from "../../src/binder/types";

jest.mock("../../src/binder/getNodePropertyConstructor");
jest.mock("../../src/binder/getStatePropertyConstructor");

describe("getPropertyConstructors", () => {
  const mockNode = {} as Node;
  const mockNodePropertyName = "mockNodeProperty";
  const mockStatePropertyName = "mockStateProperty";
  const mockUseKeyed = true;

  beforeEach(() => {
    (getNodePropertyConstructor as jest.Mock).mockClear();
    (getStatePropertyConstructor as jest.Mock).mockClear();
  });

  it("should return the correct PropertyConstructors", () => {
    const mockNodePropertyConstructor = jest.fn();
    const mockStatePropertyConstructor = jest.fn();

    (getNodePropertyConstructor as jest.Mock).mockReturnValue(mockNodePropertyConstructor);
    (getStatePropertyConstructor as jest.Mock).mockReturnValue(mockStatePropertyConstructor);

    const result: PropertyConstructors = getPropertyConstructors(
      mockNode,
      mockNodePropertyName,
      mockStatePropertyName,
      mockUseKeyed
    );

    expect(result).toEqual({
      nodePropertyConstructor: mockNodePropertyConstructor,
      statePropertyConstructor: mockStatePropertyConstructor,
    });

    expect(getNodePropertyConstructor).toHaveBeenCalledWith(mockNode, mockNodePropertyName, mockUseKeyed);
    expect(getStatePropertyConstructor).toHaveBeenCalledWith(mockStatePropertyName);
  });

  it("should call getNodePropertyConstructor with correct parameters", () => {
    getPropertyConstructors(mockNode, mockNodePropertyName, mockStatePropertyName, mockUseKeyed);
    expect(getNodePropertyConstructor).toHaveBeenCalledWith(mockNode, mockNodePropertyName, mockUseKeyed);
  });

  it("should call getStatePropertyConstructor with correct parameters", () => {
    getPropertyConstructors(mockNode, mockNodePropertyName, mockStatePropertyName, mockUseKeyed);
    expect(getStatePropertyConstructor).toHaveBeenCalledWith(mockStatePropertyName);
  });
});