
import { getAccessorProperties } from "../../src/state/AccessorProperties";

describe("getAccessorProperties", () => {
  test("getAccessorProperties should return the correct accessor properties", () => {
    const accessorProperties = getAccessorProperties({a:1, b:2});
    expect(accessorProperties).toStrictEqual([]);
  });
  test("getAccessorProperties should return the correct accessor properties", () => {
    const accessorProperties = getAccessorProperties({get a() {return 1}, b:2});
    expect(accessorProperties).toStrictEqual(["a"]);
  });
  test("getAccessorProperties should return the correct accessor properties", () => {
    const accessorProperties = getAccessorProperties({a:1, get b() {return 2}});
    expect(accessorProperties).toStrictEqual(["b"]);
  });
  test("getAccessorProperties should return the correct accessor properties", () => {
    const accessorProperties = getAccessorProperties({get a() {return 1}, get b() {return 2}});
    expect(accessorProperties).toStrictEqual(["a", "b"]);
  });
  test("getAccessorProperties should return the correct accessor properties", () => {
    class AAA {
      get aaa() {
        return 1;
      }
    }
    const accessorProperties = getAccessorProperties(new AAA);
    expect(accessorProperties).toStrictEqual(["aaa"]);
    const accessorProperties2 = getAccessorProperties(new AAA);
    expect(accessorProperties2).toStrictEqual(["aaa"]);
  });
  test("getAccessorProperties should return the correct accessor properties", () => {
    class AAA {
      get aaa() {
        return 1;
      }
    }
    class AAAA extends AAA {
      get aaa() {
        return 2;
      }
    }
    const accessorProperties = getAccessorProperties(new AAAA);
    expect(accessorProperties).toStrictEqual(["aaa"]);
  });
});