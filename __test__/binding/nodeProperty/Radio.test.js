import { MultiValue } from "../../../src/binding/nodeProperty/MultiValue.js";
import { Radio } from "../../../src/binding/nodeProperty/Radio.js";
import { inputFilters } from "../../../src/filter/Builtin.js";
import { Filter } from "../../../src/filter/Filter.js";

describe("Radio", () => {
  /** @type {Radio} */
  let radio;
  let node;

  beforeEach(() => {
    const binding = {}; // Mock binding object
    node = document.createElement("input"); // Mock element node
    node.type = "radio"; // Mock element node type
    node.value = "value"; // Mock element node value
    node.checked = false; // Mock element node checked
    const name = "radio"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    // Create a new instance of Radio before each test
    radio = new Radio(binding, node, name, filters, filterFuncs);
  });

  it("should have an inputElement property", () => {
    // Test that the inputElement property exists and is of type HTMLInputElement
    expect(radio.inputElement).toBeInstanceOf(HTMLInputElement);
  });

  it("should have a value property", () => {
    // Test that the value property exists and is of type MultiValue
    expect(radio.value).toBeInstanceOf(MultiValue);
    expect(radio.value.value).toBe("value");
    expect(radio.value.enabled).toBe(false);
    radio.inputElement.value = "value2";
    radio.inputElement.checked = true;
    expect(radio.value.value).toBe("value2");
    expect(radio.value.enabled).toBe(true);
  });

  it("should set the value property with own value", () => {
    // Test setting the value property with own value
    const sampleValue = "value";
    radio.value = sampleValue;
    expect(radio.inputElement.value).toEqual("value");
    expect(radio.inputElement.checked).toEqual(true);
    radio.inputElement.checked = false;
    radio.value = sampleValue;
    expect(radio.inputElement.value).toEqual("value");
    expect(radio.inputElement.checked).toEqual(true);
  });

  it("should set the value property with not own value", () => {
    // Test setting the value property with not own value
    const sampleValue = "value2";
    radio.value = sampleValue;
    expect(radio.inputElement.value).toEqual("value");
    expect(radio.inputElement.checked).toEqual(false);
    radio.inputElement.checked = true;
    radio.value = sampleValue;
    expect(radio.inputElement.value).toEqual("value");
    expect(radio.inputElement.checked).toEqual(false);
  });

  it("should have a filteredValue property", () => {
    // Test that the filteredValue property exists and is of type MultiValue
    const binding = {}; // Mock binding object
    const node = document.createElement("input"); // Mock element node
    node.type = "radio"; // Mock element node type
    node.value = "100"; // Mock element node value
    node.checked = false; // Mock element node checked
    const name = "radio"; // Mock property name
    const filter = Object.assign(new Filter(), {name:"number", options:[]});
    const filters = [filter]; // Mock filters array
    radio = new Radio(binding, node, name, filters, {number:inputFilters.number});
    expect(radio.filteredValue).toBeInstanceOf(MultiValue);
    expect(radio.filteredValue.value).toBe(100);
    expect(radio.filteredValue.enabled).toBe(false);
    expect(radio.inputElement.value).toBe("100");
    expect(radio.inputElement.checked).toBe(false);
    radio.value = 100;
    expect(radio.inputElement.value).toBe("100");
    expect(radio.inputElement.checked).toBe(true);
    node.checked = false;
    radio.value = "100";
    expect(radio.inputElement.value).toBe("100");
    expect(radio.inputElement.checked).toBe(false);
  });

  it("isSameValue method should return always false", () => {
    // Test that the isSameValue method exists
    expect(radio.isSameValue()).toBe(false);
  });

  test ("constructor raise", () => {
    // Test that the constructor raises an error for invalid node
    const binding = {}; // Mock binding object
    const node = {}; // Mock element node
    const name = "radio"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    expect(() => {
      new Radio(binding, node, name, filters, filterFuncs);
    }).toThrow("Radio: not htmlInputElement");
  });

  test ("constructor raise", () => {
    // Test that the constructor raises an error for invalid node type
    const binding = {}; // Mock binding object
    const node = document.createElement("input"); // Mock element node
    node.type = "text"; // Mock element node type
    const name = "radio"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    expect(() => {
      new Radio(binding, node, name, filters, filterFuncs);
    }).toThrow("Radio: not radio");
  });
});
