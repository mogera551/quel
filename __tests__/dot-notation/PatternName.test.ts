import { getPatternNameInfo } from '../../src/dot-notation/PatternName';

describe('getPatternNameInfo', () => {
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa");
    expect(patternNameInfo.isPrimitive).toBe(true);
    expect(patternNameInfo.lastPathName).toBe("aaa");
    expect(patternNameInfo.level).toBe(0);
    expect(patternNameInfo.name).toBe("aaa");
    expect(patternNameInfo.parentPath).toBe("");
    expect(patternNameInfo.parentPathNames).toStrictEqual([]);
    expect(patternNameInfo.parentPaths).toStrictEqual([]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set());
    expect(patternNameInfo.wildcardNames).toStrictEqual([]);
  });
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa.bbb");
    expect(patternNameInfo.isPrimitive).toBe(false);
    expect(patternNameInfo.lastPathName).toBe("bbb");
    expect(patternNameInfo.level).toBe(0);
    expect(patternNameInfo.name).toBe("aaa.bbb");
    expect(patternNameInfo.parentPath).toBe("aaa");
    expect(patternNameInfo.parentPathNames).toStrictEqual(["aaa"]);
    expect(patternNameInfo.parentPaths).toStrictEqual(["aaa"]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa", "bbb"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa\\.bbb$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set(["aaa"]));
    expect(patternNameInfo.wildcardNames).toStrictEqual([]);
  });
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa.*");
    expect(patternNameInfo.isPrimitive).toBe(false);
    expect(patternNameInfo.lastPathName).toBe("*");
    expect(patternNameInfo.level).toBe(1);
    expect(patternNameInfo.name).toBe("aaa.*");
    expect(patternNameInfo.parentPath).toBe("aaa");
    expect(patternNameInfo.parentPathNames).toStrictEqual(["aaa"]);
    expect(patternNameInfo.parentPaths).toStrictEqual(["aaa"]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa", "*"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa\\.([0-9a-zA-Z_]*)$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set(["aaa"]));
    expect(patternNameInfo.wildcardNames).toStrictEqual(["aaa.*"]);
  });
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa.*.ccc");
    expect(patternNameInfo.isPrimitive).toBe(false);
    expect(patternNameInfo.lastPathName).toBe("ccc");
    expect(patternNameInfo.level).toBe(1);
    expect(patternNameInfo.name).toBe("aaa.*.ccc");
    expect(patternNameInfo.parentPath).toBe("aaa.*");
    expect(patternNameInfo.parentPathNames).toStrictEqual(["aaa", "*"]);
    expect(patternNameInfo.parentPaths).toStrictEqual(["aaa", "aaa.*"]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa", "*", "ccc"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa\\.([0-9a-zA-Z_]*)\\.ccc$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set(["aaa", "aaa.*"]));
    expect(patternNameInfo.wildcardNames).toStrictEqual(["aaa.*"]);
  });
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa.*.ccc.*");
    expect(patternNameInfo.isPrimitive).toBe(false);
    expect(patternNameInfo.lastPathName).toBe("*");
    expect(patternNameInfo.level).toBe(2);
    expect(patternNameInfo.name).toBe("aaa.*.ccc.*");
    expect(patternNameInfo.parentPath).toBe("aaa.*.ccc");
    expect(patternNameInfo.parentPathNames).toStrictEqual(["aaa", "*", "ccc"]);
    expect(patternNameInfo.parentPaths).toStrictEqual(["aaa", "aaa.*", "aaa.*.ccc"]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa", "*", "ccc", "*"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa\\.([0-9a-zA-Z_]*)\\.ccc\\.([0-9a-zA-Z_]*)$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set(["aaa", "aaa.*", "aaa.*.ccc"]));
    expect(patternNameInfo.wildcardNames).toStrictEqual(["aaa.*", "aaa.*.ccc.*"]);
  });
  test('getPatternNameInfo should return the correct pattern name info', () => {
    const patternNameInfo = getPatternNameInfo("aaa.*.ccc.*");
    expect(patternNameInfo.isPrimitive).toBe(false);
    expect(patternNameInfo.lastPathName).toBe("*");
    expect(patternNameInfo.level).toBe(2);
    expect(patternNameInfo.name).toBe("aaa.*.ccc.*");
    expect(patternNameInfo.parentPath).toBe("aaa.*.ccc");
    expect(patternNameInfo.parentPathNames).toStrictEqual(["aaa", "*", "ccc"]);
    expect(patternNameInfo.parentPaths).toStrictEqual(["aaa", "aaa.*", "aaa.*.ccc"]);
    expect(patternNameInfo.pathNames).toStrictEqual(["aaa", "*", "ccc", "*"]);
    expect(patternNameInfo.regexp).toStrictEqual(RegExp("^aaa\\.([0-9a-zA-Z_]*)\\.ccc\\.([0-9a-zA-Z_]*)$"));
    expect(patternNameInfo.setOfParentPaths).toStrictEqual(new Set(["aaa", "aaa.*", "aaa.*.ccc"]));
    expect(patternNameInfo.wildcardNames).toStrictEqual(["aaa.*", "aaa.*.ccc.*"]);
  });
});




