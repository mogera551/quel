import { ElementClass } from "../../../src/binding/nodePoperty/ElementClass.js";

const binding = {};

test("ElementClass", () => {
  const element = document.createElement("div");
  const elementClass = new ElementClass(binding, element, "class.selected", [], {});
  expect(elementClass.binding).toBe(binding);
  expect(elementClass.node).toBe(element);
  expect(elementClass.element).toBe(element);
  expect(elementClass.name).toBe("class.selected");
  expect(elementClass.nameElements).toEqual(["class", "selected"]);
  expect(elementClass.className).toBe("selected");
  expect(elementClass.filters).toEqual([]);
  expect(elementClass.filterFuncs).toEqual({});
  expect(elementClass.value).toBe(false);
  expect(elementClass.filteredValue).toBe(false);
  expect(elementClass.applicable).toBe(true);

  expect(elementClass.applicable).toBe(true);

  element.className = "selected";
  expect(elementClass.value).toBe(true);

  element.className = "fugafuga selected hogehoge";
  expect(elementClass.value).toBe(true);

  elementClass.value = false;
  expect(element.className).toBe("fugafuga hogehoge");

  elementClass.value = true;
  expect(element.className).toBe("fugafuga hogehoge selected");
});