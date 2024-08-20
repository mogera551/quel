import "jest";
import { DependentProps } from "../../src/newState/DependentProps";

describe("DependentProps", () => {
  it("should initialize _defaultProps as an empty set", () => {
    const dependentProps = new DependentProps({});
    expect(dependentProps.propsByRefProp).toEqual(new Map);
  });
  it("should return false if the prop is not a default prop", () => {
    const dependentProps = new DependentProps({});
    expect(dependentProps.hasDefaultProp("aaa")).toBe(false);
  });
  it("should return true if the prop is a default prop", () => {
    const dependentProps = new DependentProps({});
    dependentProps.addDefaultProp("aaa.bbb");
    expect(dependentProps.hasDefaultProp("aaa.bbb")).toBe(true);
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.addDefaultProp("aaa.bbb");
    expect(dependentProps.propsByRefProp).toEqual(new Map([ ["aaa", new Set(["aaa.bbb"])] ]));
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.addDefaultProp("aaa.bbb.ccc");
    expect(dependentProps.propsByRefProp).toEqual(new Map([["aaa", new Set(["aaa.bbb"])], ["aaa.bbb", new Set(["aaa.bbb.ccc"])]]));
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.addDefaultProp("aaa.bbb.ccc");
    dependentProps.addDefaultProp("aaa.bbb.ddd");
    expect(dependentProps.propsByRefProp).toEqual(new Map([
      ["aaa", new Set(["aaa.bbb"])],
      ["aaa.bbb", new Set(["aaa.bbb.ccc", "aaa.bbb.ddd"])]
    ]));
  });
  it("should add default props", () => {
    const dependentProps = new DependentProps({});
    dependentProps.addDefaultProp("aaa.bbb.ccc");
    dependentProps.addDefaultProp("aaa.bbb.ddd");
    dependentProps.addDefaultProp("aaa.bbb.eee");
    expect(dependentProps.propsByRefProp).toEqual(new Map([
      ["aaa", new Set(["aaa.bbb"])],
      ["aaa.bbb", new Set(["aaa.bbb.ccc", "aaa.bbb.ddd", "aaa.bbb.eee"])]
    ]));
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual(new Map([["bbb", new Set(["aaa"])]]));
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"], ccc:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual(new Map([["bbb", new Set(["aaa", "ccc"])]]));
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb"], ccc:["bbb"], ddd:["bbb"] });
    expect(dependentProps.propsByRefProp).toEqual(new Map([["bbb", new Set(["aaa", "ccc", "ddd"])]]));
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb", "eee"] });
    expect(dependentProps.propsByRefProp).toEqual(new Map([["bbb", new Set(["aaa"])], ["eee", new Set(["aaa"])]]));
  });
  it("should initialize propsByRefProp", () => {
    const dependentProps = new DependentProps({ aaa:["bbb", "eee"], ccc:["bbb", "eee"] });
    expect(dependentProps.propsByRefProp).toEqual(new Map([["bbb", new Set(["aaa", "ccc"])], ["eee", new Set(["aaa", "ccc"])]]));
  });


});