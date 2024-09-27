import "jest";
import { createPropertyAccess } from "../../src/binding/createPropertyAccess";
import { getPropInfo } from "../../src/dotNotation/getPropInfo";
import { IPropInfo } from "../../src/dotNotation/types";

describe("PropertyAccess", () => {
  const mockPattern = "mockPattern";
  const mockIndexes = [1, 2, 3];
  const mockPropInfo: IPropInfo = getPropInfo("mockPattern");

  beforeEach(() => {
  });

  afterEach(() => {
  });

  it("should initialize with pattern and indexes", () => {
    const propertyAccess = createPropertyAccess(mockPattern, mockIndexes);
    expect(propertyAccess.pattern).toBe(mockPattern);
    expect(propertyAccess.indexes).toEqual(mockIndexes);
  });

  it("should initialize with pattern and default indexes", () => {
    const propertyAccess = createPropertyAccess(mockPattern, []);
    expect(propertyAccess.pattern).toBe(mockPattern);
    expect(propertyAccess.indexes).toEqual([]);
  });

  it("should lazily load propInfo", () => {
    const propertyAccess = createPropertyAccess(mockPattern, []);
    expect(propertyAccess.propInfo).toBe(mockPropInfo);
  });

});