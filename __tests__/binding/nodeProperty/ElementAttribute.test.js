import { ElementAttribute } from "../../../src/binding/nodePoperty/ElementAttribute.js";

test("ElementAttribute", () => {
  const element = document.createElement("div");
  element.setAttribute("title", "abc");
  const elementAttribute = new ElementAttribute(element, "attr.title", [], {});
  expect(elementAttribute.attributeName).toBe("title");
  expect(elementAttribute.value).toBe("abc");
  expect(element.title).toBe("abc");

  elementAttribute.value = "def";
  expect(elementAttribute.value).toBe("def");
  expect(element.title).toBe("def");
});