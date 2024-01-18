import { ElementAttribute } from "../../../src/binding/nodeProperty/ElementAttribute.js";
import { ElementBase } from "../../../src/binding/nodeProperty/ElementBase.js";

describe("ElementAttribute", () => {
  let elementAttribute;

  beforeEach(() => {
    const binding = {}; // Mock binding object
    const node = document.createElement("div"); // Mock element node
    const name = "attr.name"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    elementAttribute = new ElementAttribute(binding, node, name, filters, inputFilterFuncs);
  });

  it("should be instance of ElementBase", () => {
    expect(elementAttribute).toBeInstanceOf(ElementBase);
  });

  it("should have an empty attributeName by default", () => {
    expect(elementAttribute.attributeName).toBe("name");
  });

  it("should have a value of undefined by default", () => {
    expect(elementAttribute.value).toBe(null);
  });

  it("should set the value correctly", () => {
    const value = "test value";
    elementAttribute.value = value;
    expect(elementAttribute.value).toBe(value);
    expect(elementAttribute.element.getAttribute(elementAttribute.attributeName)).toBe(value);
  });
});
