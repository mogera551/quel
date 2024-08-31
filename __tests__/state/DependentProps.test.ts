import "jest";
import { DependentProps } from "../../src/state/DependentProps";

describe("DependentProps", () => {
  it("should initialize _defaultProps as an empty set", () => {
    const dependentProps = new DependentProps({});
    expect(dependentProps.propsByRefProp).toEqual({});
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.setDefaultProp("aaa.bbb");
    expect(dependentProps.propsByRefProp).toEqual({"aaa": new Set(["aaa.bbb"])});
    dependentProps.setDefaultProp("aaa.bbb");
    expect(dependentProps.propsByRefProp).toEqual({"aaa": new Set(["aaa.bbb"])});
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.setDefaultProp("aaa.bbb.ccc");
    expect(dependentProps.propsByRefProp).toEqual({"aaa": new Set(["aaa.bbb"]), "aaa.bbb": new Set(["aaa.bbb.ccc"])});
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.setDefaultProp("aaa.bbb.ccc");
    dependentProps.setDefaultProp("aaa.bbb.ddd");
    expect(dependentProps.propsByRefProp).toEqual({
      "aaa": new Set(["aaa.bbb"]),
      "aaa.bbb": new Set(["aaa.bbb.ccc", "aaa.bbb.ddd"])
    });
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.setDefaultProp("aaa.bbb.ccc");
    dependentProps.setDefaultProp("aaa.bbb.ddd");
    dependentProps.setDefaultProp("aaa.bbb.eee");
    expect(dependentProps.propsByRefProp).toEqual({
      "aaa": new Set(["aaa.bbb"]),
      "aaa.bbb": new Set(["aaa.bbb.ccc", "aaa.bbb.ddd", "aaa.bbb.eee"])
    });
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual({"bbb": new Set(["aaa"])});
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"], ccc:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual({"bbb": new Set(["aaa", "ccc"])});
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"], ccc:["bbb"], ddd:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual({"bbb": new Set(["aaa", "ccc", "ddd"])});
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb", "eee"] });
    expect(dependentProps.propsByRefProp).toEqual({"bbb": new Set(["aaa"]), "eee": new Set(["aaa"])});
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb", "eee"], ccc:["bbb", "eee"] });
    expect(dependentProps.propsByRefProp).toEqual({"bbb": new Set(["aaa", "ccc"]), "eee": new Set(["aaa", "ccc"])});
  });


});