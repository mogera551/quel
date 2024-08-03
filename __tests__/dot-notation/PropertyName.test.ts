
import { getPropertyNameInfo } from "../../src/dot-notation/PropertyName";

describe("getPropertyNameInfo", () => {
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa");
    expect(propertyNameInfo.hasWildcard).toBe(false);
    expect(propertyNameInfo.indexes).toStrictEqual([]);
    expect(propertyNameInfo.isDotted).toBe(false);
    expect(propertyNameInfo.isIncomplete).toBe(false);
    expect(propertyNameInfo.isPrimitive).toBe(true);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(-1);
    expect(propertyNameInfo.name).toBe("aaa");
    expect(propertyNameInfo.patternName).toBe("aaa");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.bbb");
    expect(propertyNameInfo.hasWildcard).toBe(false);
    expect(propertyNameInfo.indexes).toStrictEqual([]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(false);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(-1);
    expect(propertyNameInfo.name).toBe("aaa.bbb");
    expect(propertyNameInfo.patternName).toBe("aaa.bbb");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.*");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([undefined]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(true);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(0);
    expect(propertyNameInfo.name).toBe("aaa.*");
    expect(propertyNameInfo.patternName).toBe("aaa.*");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.*.ccc");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([undefined]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(true);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(0);
    expect(propertyNameInfo.name).toBe("aaa.*.ccc");
    expect(propertyNameInfo.patternName).toBe("aaa.*.ccc");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.1.ccc");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([1]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(false);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(-1);
    expect(propertyNameInfo.name).toBe("aaa.1.ccc");
    expect(propertyNameInfo.patternName).toBe("aaa.*.ccc");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.1.*");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([1, undefined]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(true);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(1);
    expect(propertyNameInfo.name).toBe("aaa.1.*");
    expect(propertyNameInfo.patternName).toBe("aaa.*.*");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.*.1");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([undefined, 1]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(true);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(0);
    expect(propertyNameInfo.name).toBe("aaa.*.1");
    expect(propertyNameInfo.patternName).toBe("aaa.*.*");
  });
  test("getPropertyNameInfo should return the correct property name info", () => {
    const propertyNameInfo = getPropertyNameInfo("aaa.*.1");
    expect(propertyNameInfo.hasWildcard).toBe(true);
    expect(propertyNameInfo.indexes).toStrictEqual([undefined, 1]);
    expect(propertyNameInfo.isDotted).toBe(true);
    expect(propertyNameInfo.isIncomplete).toBe(true);
    expect(propertyNameInfo.isPrimitive).toBe(false);
    expect(propertyNameInfo.lastIncompleteIndex).toBe(0);
    expect(propertyNameInfo.name).toBe("aaa.*.1");
    expect(propertyNameInfo.patternName).toBe("aaa.*.*");
  });
});