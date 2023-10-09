import { ElementClassName } from "../../../src/binding/nodePoperty/ElementClassName.js";

test("ElementClassName", () => {
  const element = document.createElement("div");
  const elementClassName = new ElementClassName(element, "class", [], {});
  expect(elementClassName.value).toEqual([]);

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