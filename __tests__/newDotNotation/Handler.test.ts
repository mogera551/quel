import 'jest';
import { Handler } from "../../src/newDotNotation/Handler";
import { GetDirectSymbol, SetDirectSymbol } from '../../src/@symbols/dotNotation';
import { getPatternInfo } from '../../src/newDotNotation/PropInfo';

describe("Handler", () => {
  let handler: Handler;

  beforeEach(() => {
    handler = new Handler();
  });

  it("should initialize _stackIndexes as an empty array", () => {
    expect(handler._stackIndexes).toEqual([]);
  });

  it("should return the last stack indexes", () => {
    handler._stackIndexes = [[1, 2, 3], [4, 5, 6]];
    expect(handler.lastStackIndexes).toEqual([4, 5, 6]);
  });

  it("should update stack indexes and execute the callback", () => {
    const callback = () => {
      expect(handler._stackIndexes).toEqual([[1, 2, 3]]);
      expect(handler._namedStackIndexes.keys()).toEqual(["aaa.*", "aaa.*.*", "aaa.*.*.*"]);
      expect(handler._namedStackIndexes.values()).toEqual([[1], [1,2], [1,2,3]]);
    };
    const pattern = getPatternInfo("aaa.*.*.*");
    handler.withIndexes(pattern, [1, 2, 3], callback);
    //expect(callback).toHaveBeenCalled();
  });

  it("should call _get method with primitive property", () => {
    const target = { aaa:100 };
    const receiver = target;
    expect(handler._get(target, "aaa", receiver)).toBe(100);
  });

  it("should call _get method with sub property", () => {
    const target = { aaa:{ bbb:200 } };
    const receiver = target;
    expect(handler._get(target, "aaa.bbb", receiver)).toBe(200);
  });

  it("should call _get method with sub property", () => {
    const target = { aaa:{ bbb: { ccc:300 } } };
    const receiver = target;
    expect(handler._get(target, "aaa.bbb.ccc", receiver)).toBe(300);
  });

  it("should call _get method with sub property", () => {
    const target = { "aaa.bbb": { ccc:300 } };
    const receiver = target;
    expect(handler._get(target, "aaa.bbb.ccc", receiver)).toBe(300);
  });

  it("should call _get method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ] };
    const receiver = target;
    expect(handler._get(target, "aaa.0", receiver)).toBe(11);
    expect(handler._get(target, "aaa.1", receiver)).toBe(22);
    expect(handler._get(target, "aaa.2", receiver)).toBe(33);
    expect(handler._get(target, "aaa.3", receiver)).toBe(44);
  });

  it("should call _get method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ], "aaa.*": 55 };
    const receiver = target;
    expect(handler._get(target, "aaa.0", receiver)).toBe(55);
    expect(handler._get(target, "aaa.1", receiver)).toBe(55);
    expect(handler._get(target, "aaa.2", receiver)).toBe(55);
    expect(handler._get(target, "aaa.3", receiver)).toBe(55);
  });

  it("should call _set method with primitive property", () => {
    const target = { aaa:100 };
    const receiver = target;
    expect(handler._set(target, "aaa", 200, receiver)).toBe(true);
    expect(handler._get(target, "aaa", receiver)).toBe(200);
  });

  it("should call _set method with sub property", () => {
    const target = { aaa:{ bbb:200 } };
    const receiver = target;
    expect(handler._set(target, "aaa.bbb", 300, receiver)).toBe(true);
    expect(handler._get(target, "aaa.bbb", receiver)).toBe(300);
  });

  it("should call _set method with sub property", () => {
    const target = { aaa:{ bbb: { ccc:300 } } };
    const receiver = target;
    expect(handler._set(target, "aaa.bbb.ccc", 400, receiver)).toBe(true);
    expect(handler._get(target, "aaa.bbb.ccc", receiver)).toBe(400);
  });

  it("should call _set method with sub property", () => {
    const target = { "aaa.bbb": { ccc:300 } };
    const receiver = target;
    expect(handler._set(target, "aaa.bbb.ccc", 400, receiver)).toBe(true);
    expect(handler._get(target, "aaa.bbb.ccc", receiver)).toBe(400);
  });

  it("should call _set method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ] };
    const receiver = target;
    expect(handler._set(target, "aaa.0", 111, receiver)).toBe(true);
    expect(handler._get(target, "aaa.0", receiver)).toBe(111);
    expect(handler._set(target, "aaa.1", 222, receiver)).toBe(true);
    expect(handler._get(target, "aaa.1", receiver)).toBe(222);
    expect(handler._set(target, "aaa.2", 333, receiver)).toBe(true);
    expect(handler._get(target, "aaa.2", receiver)).toBe(333);
    expect(handler._set(target, "aaa.3", 444, receiver)).toBe(true);
    expect(handler._get(target, "aaa.3", receiver)).toBe(444);
  });

  it("should call _get method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ] };
    const receiver = target;
    const pattern = getPatternInfo("aaa.*");
    handler.withIndexes(pattern, [0], () => {
      expect(handler._get(target, "aaa.*", receiver)).toBe(11);
    });
  });

  it("should call _set method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ] };
    const receiver = target;
    const pattern = getPatternInfo("aaa.*");
    handler.withIndexes(pattern, [0], () => {
      expect(handler._set(target, "aaa.*", 111, receiver)).toBe(true);
    });
    expect(handler._get(target, "aaa.0", receiver)).toBe(111);
  });

  it("should call _get method with undefined", () => {
    const target = { aaa:100 };
    const receiver = target;
    expect(handler._get(target, "bbb", receiver)).toBe(undefined);
  });

  it("should call _getExpand method", () => {
    const target = { aaa:[ 11, 22, 33 ] };
    const receiver = target;
    expect(handler._getExpand(target, "aaa.*", receiver)).toEqual([11, 22, 33]);
  });

  it("should call _getExpand method", () => {
    const target = { aaa:[ [11, 22, 33], [111, 222, 333], [1111, 2222, 3333] ] };
    const receiver = target;
    expect(handler._getExpand(target, "aaa.0.*", receiver)).toEqual([11, 22, 33]);
    expect(handler._getExpand(target, "aaa.1.*", receiver)).toEqual([111, 222, 333]);
    expect(handler._getExpand(target, "aaa.2.*", receiver)).toEqual([1111, 2222, 3333]);
    expect(handler._getExpand(target, "aaa.*.0", receiver)).toEqual([11, 111, 1111]);
    expect(handler._getExpand(target, "aaa.*.1", receiver)).toEqual([22, 222, 2222]);
    expect(handler._getExpand(target, "aaa.*.2", receiver)).toEqual([33, 333, 3333]);
    const pattern = getPatternInfo("aaa.*.*");
    handler.withIndexes(pattern, [0], () => {
      expect(handler._getExpand(target, "aaa.*.*", receiver)).toEqual([11, 22, 33]);
    });
    handler.withIndexes(pattern, [1], () => {
      expect(handler._getExpand(target, "aaa.*.*", receiver)).toEqual([111, 222, 333]);
    });
    handler.withIndexes(pattern, [2], () => {
      expect(handler._getExpand(target, "aaa.*.*", receiver)).toEqual([1111, 2222, 3333]);
    });
  });

  it("should call _setExpand method", () => {
    const target = { aaa:[ 11, 22, 33 ] };
    const receiver = target;
    handler._setExpand(target, "aaa.*", 44, receiver);
    expect(handler._getExpand(target, "aaa.*", receiver)).toEqual([44, 44, 44]);
    handler._setExpand(target, "aaa.*", [55, 66, 77], receiver);
    expect(handler._getExpand(target, "aaa.*", receiver)).toEqual([55, 66, 77]);
  });

  it("should call get/set method", () => {
    const target = { aaa:[ [11, 22, 33], [111, 222, 333], [1111, 2222, 3333] ] };
    const receiver = target;
    expect(handler.get(target, "aaa", receiver)).toEqual([ [11, 22, 33], [111, 222, 333], [1111, 2222, 3333] ]);
    expect(handler.get(target, "aaa.0", receiver)).toEqual([11, 22, 33]);
    expect(handler.get(target, "aaa.0.0", receiver)).toBe(11);
    const fnGet = handler.get(target, GetDirectSymbol, receiver);
    expect(fnGet("aaa.*", [0])).toEqual([11, 22, 33]);
    expect(fnGet("aaa.*.*", [0, 0])).toBe(11);
    expect(fnGet("aaa.*", [1])).toEqual([111, 222, 333]);
    expect(fnGet("aaa.*.*", [1, 1])).toBe(222);
    const fnSet = handler.get(target, SetDirectSymbol, receiver);
    fnSet("aaa.*.*", [0, 0], 11111);
    expect(fnGet("aaa.*.*", [0, 0])).toEqual(11111);
    fnSet("aaa.*.*", [1, 1], 22222);
    expect(fnGet("aaa.*.*", [1, 1])).toEqual(22222);
  });

  it("should call get/set method", () => {
    const target = { aaa:[ [11, 22, 33], [111, 222, 333], [1111, 2222, 3333] ] };
    const receiver = target;

    const fnGet = handler.get(target, GetDirectSymbol, receiver);
    expect(fnGet("aaa.0.0", [1, 1])).toBe(11);
    expect(fnGet("aaa.*.0", [1, 1])).toBe(111);
    expect(fnGet("aaa.0.*", [1, 1])).toBe(22);
  });

  it("should call get/set method", () => {
    const sym = Symbol("sym");
    const target = { aaa:[ [11, 22, 33], [111, 222, 333], [1111, 2222, 3333] ],[sym]:"aaa", $bbb:"bbb", ddd:100, "@@__":"@@" };
    const receiver = target;

    const fnGet = handler.get(target, GetDirectSymbol, receiver);
    expect(fnGet("$1", [2, 1])).toBe(2);
    expect(fnGet("$2", [2, 1])).toBe(1);

    expect(fnGet("@aaa.*.*", [2])).toEqual([1111, 2222, 3333]);
    expect(fnGet("@aaa.*.*", [1])).toEqual([111, 222, 333]);

    expect(fnGet("@aaa.*.0", [])).toEqual([11, 111, 1111]);
    expect(fnGet("@aaa.*.0", [2])).toEqual([11, 111, 1111]);

    expect(fnGet("constructor", [])).toEqual(Object);
    expect(fnGet(sym, [])).toBe("aaa");
    expect(fnGet("$bbb", [])).toBe("bbb");
    expect(fnGet("@@__", [])).toBe("@@");

    const fnSet = handler.get(target, SetDirectSymbol, receiver);
    expect(() => {
      fnSet("$1", [2, 1], 5)
    }).toThrow("context index($1) is read only");
    fnSet(sym, [], "bbb");
    expect(fnGet(sym, [])).toBe("bbb");
    fnSet("@aaa.*.*", [0], [ 11111, 22222, 33333 ]);
    expect(fnGet("@aaa.*.*", [0])).toEqual([ 11111, 22222, 33333 ]);
    expect(() => {
      fnGet("@aaa.*.*", []);
    }).toThrow("wildcard is undefined");
    expect(() => {
      fnSet("@aaa.*.*", [], []);
    }).toThrow("wildcard is undefined");
    fnSet("$bbb", [], "BBB");
    expect(fnGet("$bbb", [])).toBe("BBB");
    fnSet("@@__", [], "@@@@");
    expect(fnGet("@@__", [])).toBe("@@@@");
    expect(() => {
      fnGet("@ddd.*", []);
    }).toThrow("parent value is not array");
    expect(() => {
      fnSet("@ddd.*", [200]);
    }).toThrow("parent value is not array");

  });

});