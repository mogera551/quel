import { ElementStyle } from "../../../src/binding/nodeProperty/ElementStyle.js";

describe("ElementStyle", () => {
  let elementStyle;
  let node;

  beforeEach(() => {
    // Create a new instance of ElementStyle before each test
    const binding = {}; // Mock binding object
    node = document.createElement("div"); // Mock element node
    const name = "style.color"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    elementStyle = new ElementStyle(binding, node, name, filters, inputFilterFuncs);
  });

  it("should have the correct htmlElement", () => {
    expect(elementStyle.htmlElement).toBe(node);
    expect(elementStyle.htmlElement).toBeInstanceOf(Element);
    expect(elementStyle.htmlElement).toBeInstanceOf(HTMLElement);
  });

  it("should have the correct styleName", () => {
    expect(elementStyle.styleName).toBe("color");
  });

  it("should have the correct value", () => {
    const value = "red";
    elementStyle.value = value;
    expect(elementStyle.value).toBe(value);
    expect(elementStyle.htmlElement.style.color).toBe(value);
  });

  test("it's value property should be empty string", () => {
    expect(elementStyle.value).toBe("");
  });

  it("should throw error for invalid node", () => {
    const binding = {}; // Mock binding object
    const node = {}; // Mock element node
    const name = "style.color"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    expect(() => {
      new ElementStyle(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("ElementStyle: not htmlElement");
  });
});
