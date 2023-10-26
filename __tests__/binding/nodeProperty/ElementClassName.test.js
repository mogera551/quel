import { ElementClassName } from "../../../src/binding/nodePoperty/ElementClassName.js";

const binding = {};

test("ElementClassName", () => {
  const element = document.createElement("div");
  const elementClassName = new ElementClassName(binding, element, "class", [], {});
  expect(elementClassName.binding).toBe(binding);
  expect(elementClassName.node).toBe(element);
  expect(elementClassName.element).toBe(element);
  expect(elementClassName.name).toBe("class");
  expect(elementClassName.nameElements).toEqual(["class"]);
  expect(elementClassName.filters).toEqual([]);
  expect(elementClassName.filterFuncs).toEqual({});
  expect(elementClassName.value).toEqual([]);
  expect(elementClassName.filteredValue).toEqual([]);
  expect(elementClassName.applicable).toBe(true);

  element.className = "aaa";
  expect(elementClassName.value).toEqual(["aaa"]);

  element.className = "aaa bbb";
  expect(elementClassName.value).toEqual(["aaa", "bbb"]);

  element.className = "aaa bbb ccc";
  expect(elementClassName.value).toEqual(["aaa", "bbb", "ccc"]);

  elementClassName.value = ["aaa"];
  expect(element.className).toBe("aaa");

  elementClassName.value = ["aaa", "bbb"];
  expect(element.className).toBe("aaa bbb");

  elementClassName.value = ["aaa", "bbb", "ccc"];
  expect(element.className).toBe("aaa bbb ccc");
})