import { DependentProps } from "../../src/viewModel/DependentProps.js";

test("DependentProps addDefaultProp primitive", () => {
  const dependentProps = new DependentProps;
  dependentProps.addDefaultProp("aaa");
  const setOfPropsByRefProp = dependentProps.setOfPropsByRefProp;

  expect(Array.from(setOfPropsByRefProp.keys())).toEqual([]);
});

test("DependentProps addDefaultProp level1", () => {
  const dependentProps = new DependentProps;
  dependentProps.addDefaultProp("aaa.*");
  const setOfPropsByRefProp = dependentProps.setOfPropsByRefProp;

  expect(Array.from(setOfPropsByRefProp.keys())).toEqual(["aaa"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa")))).toEqual(["aaa.*"]);
});

test("DependentProps addDefaultProp level multi", () => {
  const dependentProps = new DependentProps;
  dependentProps.addDefaultProp("aaa.*.*");
  const setOfPropsByRefProp = dependentProps.setOfPropsByRefProp;

  expect(Array.from(setOfPropsByRefProp.keys())).toEqual(["aaa.*", "aaa"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa.*")))).toEqual(["aaa.*.*"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa")))).toEqual(["aaa.*"]);

  expect(dependentProps.hasDefaultProp("aaa.*.*")).toBe(true);
});

test("DependentProps addDefaultProp same parent prop", () => {
  const dependentProps = new DependentProps;
  dependentProps.addDefaultProp("aaa.*.*.aaa");
  dependentProps.addDefaultProp("aaa.*.*.bbb");
  const setOfPropsByRefProp = dependentProps.setOfPropsByRefProp;

  expect(Array.from(setOfPropsByRefProp.keys())).toEqual(["aaa.*.*", "aaa.*", "aaa"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa.*.*")))).toEqual(["aaa.*.*.aaa", "aaa.*.*.bbb"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa.*")))).toEqual(["aaa.*.*"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa")))).toEqual(["aaa.*"]);
});

test("DependentProps setDependentProps", () => {
  const dependentProps = new DependentProps;
  dependentProps.setDependentProps({
    "aaa.ccc" : ["aaa.aaa", "aaa.bbb"]
  });
  const setOfPropsByRefProp = dependentProps.setOfPropsByRefProp;

  expect(Array.from(setOfPropsByRefProp.keys())).toEqual(["aaa.aaa", "aaa.bbb"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa.aaa")))).toEqual(["aaa.ccc"]);
  expect(Array.from(Array.from(setOfPropsByRefProp.get("aaa.bbb")))).toEqual(["aaa.ccc"]);
});
