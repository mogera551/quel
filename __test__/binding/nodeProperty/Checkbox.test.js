import { Checkbox } from "../../../src/binding/nodeProperty/Checkbox.js";
import { MultiValue } from "../../../src/binding/nodeProperty/MultiValue.js";
import { inputFilters } from "../../../src/filter/Builtin.js";
import { Filter } from "../../../src/filter/Filter.js";

describe("Checkbox", () => {
  let checkbox;
  let node;

  beforeEach(() => {
    const binding = {}; // Mock binding object
    node = document.createElement("input"); // Mock element node
    node.type = "checkbox"; // Mock element node type
    node.value = "value"; // Mock element node value
    node.checked = false; // Mock element node checked
    const name = "checkbox"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    checkbox = new Checkbox(binding, node, name, filters, filterFuncs);
  });

  it("should have an inputElement property", () => {
    expect(checkbox.inputElement).toBeDefined();
    expect(checkbox.inputElement instanceof HTMLInputElement).toBe(true);
  });

  it("should have a value property of type MultiValue", () => {
    expect(checkbox.value).toBeDefined();
    expect(checkbox.value instanceof MultiValue).toBe(true);
  });

  it("should set the value property include own value", () => {
    const value = ["value", "value2"]/* provide a test value */;
    checkbox.value = value;
    expect(checkbox.value.value).toBe("value");
    expect(checkbox.value.enabled).toBe(true);
    expect(checkbox.inputElement.checked).toBe(true);
    checkbox.inputElement.checked = false;
    checkbox.value = value;
    expect(checkbox.value.value).toBe("value");
    expect(checkbox.value.enabled).toBe(true);
    expect(checkbox.inputElement.checked).toBe(true);
  });

  it("should set the value property not include own value", () => {
    const value = ["value2"]/* provide a test value */;
    checkbox.value = value;
    expect(checkbox.value.value).toBe("value");
    expect(checkbox.value.enabled).toBe(false);
    expect(checkbox.inputElement.checked).toBe(false);
    checkbox.inputElement.checked = true;
    checkbox.value = value;
    expect(checkbox.value.value).toBe("value");
    expect(checkbox.value.enabled).toBe(false);
    expect(checkbox.inputElement.checked).toBe(false);
  });

  it("should set the value property with invalid value", () => {
    expect(() => {
      checkbox.value = "value";
    }).toThrow("Checkbox: value is not array");
  });

  it("should have a filteredValue property of type MultiValue", () => {
    const binding = {}; // Mock binding object
    const node = document.createElement("input"); // Mock element node
    node.type = "checkbox"; // Mock element node type
    node.value = "100"; // Mock element node value
    node.checked = false; // Mock element node checked
    const name = "checkbox"; // Mock property name
    const filter = Object.assign(new Filter(), {name:"number", options:[]});
    const filters = [filter]; // Mock filters array
    checkbox = new Checkbox(binding, node, name, filters, {number:inputFilters.number});
    expect(checkbox.filteredValue).toBeInstanceOf(MultiValue);
    expect(checkbox.filteredValue.value).toBe(100);
    expect(checkbox.filteredValue.enabled).toBe(false);
    expect(checkbox.inputElement.value).toBe("100");
    expect(checkbox.inputElement.checked).toBe(false);
    checkbox.value = [100];
    expect(checkbox.inputElement.value).toBe("100");
    expect(checkbox.inputElement.checked).toBe(true);
    checkbox.inputElement.checked = false;
    checkbox.value = ["100"];
    expect(checkbox.inputElement.value).toBe("100");
    expect(checkbox.inputElement.checked).toBe(false);
  });

  it("isSameValue method should return always false", () => {
    // Test that the isSameValue method exists
    expect(checkbox.isSameValue()).toBe(false);
  });

  test ("constructor raise", () => {
    // Test that the constructor raises an error for invalid node
    const binding = {}; // Mock binding object
    const node = {}; // Mock element node
    const name = "checkbox"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    expect(() => {
      new Checkbox(binding, node, name, filters, filterFuncs);
    }).toThrow("Checkbox: not htmlInputElement");
  });

  test ("constructor raise", () => {
    // Test that the constructor raises an error for invalid node type
    const binding = {}; // Mock binding object
    const node = document.createElement("input"); // Mock element node
    node.type = "text"; // Mock element node type
    const name = "checkbox"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    expect(() => {
      new Checkbox(binding, node, name, filters, filterFuncs);
    }).toThrow("Checkbox: not checkbox");
  });
});
