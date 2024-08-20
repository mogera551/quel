
import "jest";
import { getAccessorProperties } from "../../src/newState/AccessorProperties";

describe("AccessorProperties", () => {
  it("should return the accessor properties of the target", () => {
    const target = {
      get aaa() { return 100; },
      set aaa(value) { console.log("value", value); },
      get bbb() { return 200; },
      ccc: 300,
    };
    expect(getAccessorProperties(target)).toEqual(["aaa", "bbb"]);
  });
  it("should return the accessor properties of the target", () => {
    class baseClass {
      get aaa() { return 100; }
      set aaa(value) { console.log("value", value); }
      get bbb() { return 200; }
      ccc = 300;
    }
    class subClass extends baseClass {
      get ddd() { return 400; }
      set ddd(value) { console.log("value", value); }
      eee = 300;
    }
    const target = new subClass();
    expect(getAccessorProperties(target)).toEqual(["ddd", "aaa", "bbb"]);
  });
});