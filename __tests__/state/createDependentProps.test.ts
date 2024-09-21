import "jest";
import { createDependentProps } from "../../src/state/createDependentProps";
import { IDependentProps } from "../../src/state/types";
import { getPatternInfo } from "../../src/dotNotation/getPatternInfo";

jest.mock("../../src/dotNotation/getPatternInfo");

describe("createDependentProps", () => {
  const mockGetPatternInfo = getPatternInfo as jest.MockedFunction<typeof getPatternInfo>;

  beforeEach(() => {
    mockGetPatternInfo.mockClear();
  });

  it("should create an instance of DependentProps", () => {
    const props = { propA: ["refProp1", "refProp2"], propB: ["refProp2"] };
    const dependentProps = createDependentProps(props);
    expect(dependentProps).toBeInstanceOf(Object);
  });

  it("should set dependent props correctly", () => {
    const props = { propA: ["refProp1", "refProp2"], propB: ["refProp2"] };
    const dependentProps = createDependentProps(props);
    expect(dependentProps.propsByRefProp).toEqual({
      refProp1: new Set(["propA"]),
      refProp2: new Set(["propA", "propB"]),
    });
  });

  it("should set default props correctly", () => {
    const props = { propA: ["refProp1", "refProp2"], propB: ["refProp2"] };
    const dependentProps = createDependentProps(props);
    mockGetPatternInfo.mockReturnValue({
      patternPaths: ["pattern1", "pattern2", "pattern3"],
    } as any);

    dependentProps.setDefaultProp("pattern3");

    expect(dependentProps.propsByRefProp).toEqual({
      refProp1: new Set(["propA"]),
      refProp2: new Set(["propA", "propB"]),
      pattern1: new Set(["pattern2"]),
      pattern2: new Set(["pattern3"]),
    });
  });

  it("should not add duplicate default props", () => {
    const props = { propA: ["refProp1", "refProp2"], propB: ["refProp2"] };
    const dependentProps = createDependentProps(props);
    mockGetPatternInfo.mockReturnValue({
      patternPaths: ["pattern1", "pattern2", "pattern3"],
    } as any);

    dependentProps.setDefaultProp("pattern3");
    dependentProps.setDefaultProp("pattern3");

    expect(dependentProps.propsByRefProp).toEqual({
      refProp1: new Set(["propA"]),
      refProp2: new Set(["propA", "propB"]),
      pattern1: new Set(["pattern2"]),
      pattern2: new Set(["pattern3"]),
    });
  });
});