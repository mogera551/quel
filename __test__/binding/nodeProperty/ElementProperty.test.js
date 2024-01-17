import { ElementBase } from "../../../src/binding/nodeProperty/ElementBase.js";
import { ElementProperty } from "../../../src/binding/nodeProperty/ElementProperty.js";

describe("ElementProperty isSelectValue property", () => {
  test("it's isSelectValue property is false", () => {
    const binding = {}; // Mock binding object
    const node = document.createElement("div"); // Mock element node
    const name = "testName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    const elementProperty = new ElementProperty(binding, node, name, filters, inputFilterFuncs);
    expect(elementProperty.isSelectValue).toBe(false);
  });
  test("it's isSelectValue property is true", () => {
    const binding = {}; // Mock binding object
    const node = document.createElement("select"); // Mock element node
    const name = "value"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    const elementProperty = new ElementProperty(binding, node, name, filters, inputFilterFuncs);
    expect(elementProperty.isSelectValue).toBe(true);
    expect(elementProperty.isSelectValue).toBe(true); // cache result
  });
});

describe("ElementProperty instance of ElementBase", () => {
  test("should be instance of ElementBase", () => {
    const binding = {}; // Mock binding object
    const node = document.createElement("div"); // Mock element node
    const name = "testName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    const elementProperty = new ElementProperty(binding, node, name, filters, inputFilterFuncs);
    expect(elementProperty).toBeInstanceOf(ElementBase);
  });
});