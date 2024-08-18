import 'jest';
import { Handler } from "../../src/newDotNotation/Handler";

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
    };
    handler.withIndexes([1, 2, 3], callback);
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
    handler.withIndexes([0], () => {
      expect(handler._get(target, "aaa.*", receiver)).toBe(11);
    });
  });

  it("should call _set method with array property", () => {
    const target = { aaa:[ 11, 22, 33, 44 ] };
    const receiver = target;
    handler.withIndexes([0], () => {
      expect(handler._set(target, "aaa.*", 111, receiver)).toBe(true);
    });
    expect(handler._get(target, "aaa.0", receiver)).toBe(111);
  });

  it("should call _get method with undefined", () => {
    const target = { aaa:100 };
    const receiver = target;
    expect(handler._get(target, "bbb", receiver)).toBe(undefined);
  });
});