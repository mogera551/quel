import { ViewModelize } from "../../src/newViewModel/ViewModelize.js";

test('ViewModelize getProperties, getMethods', () => {
  class BaseViewModel {
    ddd() {

    }
    "eee" = 111;
  }
  class ViewModel extends BaseViewModel {
    "aaa" = 100;
    get "bbb"() {
      return 1000;
    }
    ccc() {

    }
    "eee" = 222;
  }
  const target = new ViewModel;
  const descByName = ViewModelize.getDescByName(target);
  expect(descByName.size).toEqual(6);
  expect(descByName.has("constructor")).toEqual(true);
  expect(descByName.has("aaa")).toEqual(true);
  expect(descByName.has("bbb")).toEqual(true);
  expect(descByName.has("ccc")).toEqual(true);
  expect(descByName.has("ddd")).toEqual(true);
  expect(descByName.has("eee")).toEqual(true);

  expect(descByName.get("constructor").value).toBe(ViewModel);
  expect(descByName.get("aaa").value).toBe(100);
  expect(typeof descByName.get("bbb").get).toBe("function");
  expect(typeof descByName.get("ccc").value).toBe("function");
  expect(typeof descByName.get("ddd").value).toBe("function");
  expect(descByName.get("eee").value).toBe(222);

  const entries = Array.from(descByName.entries());
  const descByMethodName = new Map(ViewModelize.getMethods(entries, ViewModel));
  expect(descByMethodName.size).toEqual(2);
  expect(descByMethodName.has("ccc")).toEqual(true);
  expect(descByMethodName.has("ddd")).toEqual(true);

  const descByPropName = new Map(ViewModelize.getProperties(entries, ViewModel));
  expect(descByPropName.size).toEqual(3);
  expect(descByPropName.has("aaa")).toEqual(true);
  expect(descByPropName.has("bbb")).toEqual(true);
  expect(descByPropName.has("eee")).toEqual(true);

});

test('ViewModelize viewModelize', () => {
  class ViewModel {
    "aaa";
    "aaa.*";
    "bbb";
    "bbb.ccc";
    "ddd";
    get "ddd.eee"() {
      return 100;
    }
    fff() {

    }
    get ggg() {
      return 200;
    }
  }
  const target = new ViewModel;
  const viewModelInfo = ViewModelize.viewModelize(target);
  expect("aaa" in target).toBe(true);
  expect("aaa.*" in target).toBe(false);
  expect("bbb" in target).toBe(true);
  expect("bbb.ccc" in target).toBe(false);
  expect("ddd" in target).toBe(true);
  expect("ddd.eee" in target).toBe(true);
  expect("ggg" in target).toBe(true);
  expect(viewModelInfo.definedProps).toEqual([
    "aaa", 
    "aaa.*",
    "bbb",
    "bbb.ccc",
    "ddd",
    "ddd.eee",
    "ggg"
  ]);
  expect(viewModelInfo.methods).toEqual([
    "fff"
  ]);
  expect(viewModelInfo.accessorProps).toEqual([
    "ddd.eee", "ggg"
  ]);
  const target2 = new ViewModel;
  const viewModelInfo2 = ViewModelize.viewModelize(target2);
  expect("aaa" in target2).toBe(true);
  expect("aaa.*" in target2).toBe(false);
  expect("bbb" in target2).toBe(true);
  expect("bbb.ccc" in target2).toBe(false);
  expect("ddd" in target2).toBe(true);
  expect("ddd.eee" in target2).toBe(true);
  expect("ggg" in target2).toBe(true);
  expect(viewModelInfo2.definedProps).toEqual([
    "aaa", 
    "aaa.*",
    "bbb",
    "bbb.ccc",
    "ddd",
    "ddd.eee",
    "ggg",
  ]);
  expect(viewModelInfo2.methods).toEqual([
    "fff"
  ]);
  expect(viewModelInfo2.accessorProps).toEqual([
    "ddd.eee", "ggg"
  ]);

});