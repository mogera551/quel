import { ElementBase } from "../../../src/binding/nodeProperty/ElementBase.js";
import { NodeProperty } from "../../../src/binding/nodeProperty/NodeProperty.js";

describe("ElementBase", () => {
  let elementBase;
  let node;

  beforeEach(() => {
    // Create a mock binding, node, and other necessary variables for testing
    const binding = {}; // Mock binding object
    node = document.createElement("div"); // Mock element node
    const name = "testName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    elementBase = new ElementBase(binding, node, name, filters, inputFilterFuncs);
  });

  it("should have an element property", () => {
    expect(elementBase.element).toBeInstanceOf(Element);
    expect(elementBase.element).toBeInstanceOf(HTMLElement);
  });

  it("should be instance of NodeProperty", () => {
    expect(elementBase).toBeInstanceOf(NodeProperty);
  });

  test("it's element property should be node", () => {
    expect(elementBase.element).toBe(node);
  });
  
  test("it's node property should be node", () => {
    expect(elementBase.node).toBe(node);
  });

});

describe("ElementBase invalid node", () => {
  test("should throw error for plain object", () => {
    const binding = {}; // Mock binding object
    const node = {}; // Mock element node
    const name = "testName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    expect(() => {
      new ElementBase(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("ElementBase: not element");
  });

  test("should throw error for text node", () => {
    const binding = {}; // Mock binding object
    const node = document.createTextNode("textNode"); // Mock text node
    const name = "testName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    expect(() => {
      new ElementBase(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("ElementBase: not element");
  });
});
