import { Checkbox } from "../../../src/binding/nodePoperty/Checkbox.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

const binding = {};

test("Checkbox", () => {
  const element = document.createElement("input");
  element.type = "checkbox";
  element.value = "100";
  element.checked = false;

  const checkbox = new Checkbox(binding, element, "checkbox", [], {});
  expect(checkbox.binding).toBe(binding);
  expect(checkbox.node).toBe(element);
  expect(checkbox.element).toBe(element);
  expect(checkbox.inputElement).toBe(element);
  expect(checkbox.name).toBe("checkbox");
  expect(checkbox.nameElements).toEqual(["checkbox"]);
  expect(checkbox.filters).toEqual([]);
  expect(checkbox.filterFuncs).toEqual({});
  expect(checkbox.value).toEqual({value:"100", enabled:false});
  expect(checkbox.filteredValue).toEqual({value:"100", enabled:false});
  expect(checkbox.applicable).toBe(true);

  checkbox.value = ["100"];
  expect(element.checked).toBe(true);

  checkbox.value = ["200"];
  expect(element.checked).toBe(false);

  checkbox.value = ["100", "200"];
  expect(element.checked).toBe(true);

});

test("Checkbox filtered", () => {
  const element = document.createElement("input");
  element.type = "checkbox";
  element.value = "100";
  element.checked = false;

  const checkbox = new Checkbox(binding, element, "checkbox", [{name:"number", option:[]}], inputFilters);
  expect(checkbox.value).toEqual({value:"100", enabled:false});
  expect(checkbox.filteredValue).toEqual({value:100, enabled:false});

  checkbox.value = [100];
  expect(element.checked).toBe(true);

  checkbox.value = [200];
  expect(element.checked).toBe(false);

  checkbox.value = [100, 200];
  expect(element.checked).toBe(true);
  
  checkbox.value = ["100"];
  expect(element.checked).toBe(false);
});

test("Checkbox fail", () => {
  expect(() => {
    const element = document.createElement("div");
    const checkbox = new Checkbox(binding, element, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const node = document.createTextNode("div");
    const checkbox = new Checkbox(binding, node, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const element = document.createElement("input");
    element.type = "radio";
    const checkbox = new Checkbox(binding, element, "", [], {});
  }).toThrow("not checkbox");
})