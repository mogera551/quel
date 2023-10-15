import { ElementProperty } from "../../../src/binding/nodePoperty/ElementProperty.js";

test("ElementProperty", () => {
  const element = document.createElement("div");
  element.textContent = "abc";
  const elementProperty = new ElementProperty(element, "textContent", [], {});
  expect(elementProperty.node).toBe(element);
  expect(elementProperty.element).toBe(element);
  expect(elementProperty.applicable).toBe(true);

  expect(() => {
    const node = document.createTextNode("abc");
    const elementProperty = new ElementProperty(node, "textContent", [], {});
  }).toThrow("not element");
})