import "jest";
import { PropertyAccess } from "../../src/binding/PropertyAccess";
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
    const propertyAccess = new PropertyAccess(mockPattern, mockIndexes);
    expect(propertyAccess.pattern).toBe(mockPattern);
    expect(propertyAccess.indexes).toEqual(mockIndexes);
  });

  it("should initialize with pattern and default indexes", () => {
    const propertyAccess = new PropertyAccess(mockPattern);
    expect(propertyAccess.pattern).toBe(mockPattern);
    expect(propertyAccess.indexes).toEqual([]);
  });

  it("should lazily load propInfo", () => {
    const propertyAccess = new PropertyAccess(mockPattern);
    expect(propertyAccess.propInfo).toBe(mockPropInfo);
  });

});