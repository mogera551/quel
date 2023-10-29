import { ElementProperty } from "../../../src/binding/nodePoperty/ElementProperty.js";

const binding = {};

test("ElementProperty", () => {
  const element = document.createElement("div");
  element.textContent = "abc";
  const elementProperty = new ElementProperty(binding, element, "textContent", [], {});
  expect(elementProperty.binding).toBe(binding);
  expect(elementProperty.node).toBe(element);
  expect(elementProperty.element).toBe(element);
  expect(elementProperty.name).toBe("textContent");
  expect(elementProperty.nameElements).toEqual(["textContent"]);
  expect(elementProperty.filters).toEqual([]);
  expect(elementProperty.filterFuncs).toEqual({});
  expect(elementProperty.applicable).toBe(true);
  expect(elementProperty.expandable).toBe(false);

  expect(() => {
    const node = document.createTextNode("abc");
    const elementProperty = new ElementProperty(binding, node, "textContent", [], {});
  }).toThrow("not element");
})