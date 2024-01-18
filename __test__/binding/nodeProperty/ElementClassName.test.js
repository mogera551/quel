import { ElementBase } from "../../../src/binding/nodeProperty/ElementBase.js";
import { ElementClassName } from "../../../src/binding/nodeProperty/ElementClassName.js";

describe("ElementClassName", () => {
  let elementClassName;

  beforeEach(() => {
    const binding = {}; // Mock binding object
    const node = document.createElement("div"); // Mock element node
    const name = "class"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    elementClassName = new ElementClassName(binding, node, name, filters, inputFilterFuncs);
  });

  it("should be instance of ElementBase", () => {
    expect(elementClassName).toBeInstanceOf(ElementBase);
  });

  it("should have a default value of undefined", () => {
    expect(elementClassName.value).toEqual([]);
  });

  it("should set and get the value correctly", () => {
    const value = ["aaa", "bbb", "ccc"];
    elementClassName.value = value;
    expect(elementClassName.value).toEqual(["aaa", "bbb", "ccc"]);
    expect(elementClassName.element.className).toEqual("aaa bbb ccc");
  });

  it("should throw error for non-array value", () => {
    expect(() => {
      elementClassName.value = "aaa";
    }).toThrow("ElementClassName: value is not array");
  });
});
