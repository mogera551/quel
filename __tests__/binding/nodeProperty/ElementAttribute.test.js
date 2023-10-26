import { ElementAttribute } from "../../../src/binding/nodePoperty/ElementAttribute.js";

const binding = {};

test("ElementAttribute", () => {
  const element = document.createElement("div");
  element.setAttribute("title", "abc");
  const elementAttribute = new ElementAttribute(binding, element, "attr.title", [], {});
  expect(elementAttribute.binding).toBe(binding);
  expect(elementAttribute.node).toBe(element);
  expect(elementAttribute.element).toBe(element);
  expect(elementAttribute.name).toBe("attr.title");
  expect(elementAttribute.nameElements).toEqual(["attr", "title"]);
  expect(elementAttribute.attributeName).toBe("title");
  expect(elementAttribute.filters).toEqual([]);
  expect(elementAttribute.filterFuncs).toEqual({});
  expect(elementAttribute.value).toBe("abc");
  expect(elementAttribute.filteredValue).toBe("abc");
  expect(elementAttribute.applicable).toBe(true);

  expect(element.getAttribute("title")).toBe("abc");
  elementAttribute.value = "def";
  expect(elementAttribute.value).toBe("def");
  expect(element.getAttribute("title")).toBe("def");
});