import { ElementBase } from "../../../src/binding/nodeProperty/ElementBase.js";
import { ElementClass } from "../../../src/binding/nodeProperty/ElementClass.js";

describe("ElementClass", () => {
  let elementClass;
  let node;

  beforeEach(() => {
    // Create a mock binding, node, and other necessary variables for testing
    const binding = {}; // Mock binding object
    node = document.createElement("div"); // Mock element node
    const name = "class.completed"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    elementClass = new ElementClass(binding, node, name, filters, inputFilterFuncs);
  });

  it("should have an element property", () => {
    expect(elementClass.element).toBeInstanceOf(Element);
    expect(elementClass.element).toBeInstanceOf(HTMLElement);
  });

  it("should be instance of ElementBase", () => {
    expect(elementClass).toBeInstanceOf(ElementBase);
  });

  test("it's element property should be node", () => {
    expect(elementClass.element).toBe(node);
  });
  
  test("it's node property should be node", () => {
    expect(elementClass.node).toBe(node);
  });

  test("it's className property should be nameElements[1]", () => {
    expect(elementClass.className).toBe(elementClass.nameElements[1]);
  });

  test("it's value property should be false", () => {
    expect(elementClass.value).toBe(false);
  });

  test("it's value property should be true", () => {
    elementClass.value = true;
    expect(elementClass.value).toBe(true);
    expect(elementClass.element.classList.contains(elementClass.className)).toBe(true);
  });

  test("it's value property should be false", () => {
    elementClass.value = true;
    elementClass.value = false;
    expect(elementClass.value).toBe(false);
    expect(elementClass.element.classList.contains(elementClass.className)).toBe(false);
  });

  test("it's value property should be false", () => {
    elementClass.value = true;
    elementClass.value = false;
    elementClass.value = false;
    expect(elementClass.value).toBe(false);
    expect(elementClass.element.classList.contains(elementClass.className)).toBe(false);
  });

  test("it's value property should be true", () => {
    elementClass.value = true;
    elementClass.value = false;
    elementClass.value = true;
    expect(elementClass.value).toBe(true);
    expect(elementClass.element.classList.contains(elementClass.className)).toBe(true);
  });

  test("it's value property should be true", () => {
    elementClass.value = true;
    elementClass.value = false;
    elementClass.value = true;
    elementClass.value = true;
    expect(elementClass.value).toBe(true);
    expect(elementClass.element.classList.contains(elementClass.className)).toBe(true);
  });
});

describe("ElementClass invalid name", () => {
  test("should throw error for invalid name", () => {
    const binding = {}; // Mock binding object
    const node = document.createElement("div"); // Mock element node
    const name = "invalidName"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    expect(() => {
      new ElementClass(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("ElementClass: invalid property name invalidName");
  });
});