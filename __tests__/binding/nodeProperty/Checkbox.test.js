import { Checkbox } from "../../../src/binding/nodePoperty/Checkbox.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

test("Checkbox", () => {
  const element = document.createElement("input");
  element.type = "checkbox";
  const checkbox = new Checkbox(element, "", [], {});

  element.value = "100";
  element.checked = false;
  expect(checkbox.value).toEqual({value:"100", enabled:false});
  expect(checkbox.filteredValue).toEqual({value:"100", enabled:false});

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
  const checkbox = new Checkbox(element, "", [{name:"number", option:[]}], inputFilters);

  element.value = "100";
  element.checked = false;
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
    const checkbox = new Checkbox(element, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const node = document.createTextNode("div");
    const checkbox = new Checkbox(node, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const element = document.createElement("input");
    element.type = "radio";
    const checkbox = new Checkbox(element, "", [], {});
  }).toThrow("not checkbox");
})