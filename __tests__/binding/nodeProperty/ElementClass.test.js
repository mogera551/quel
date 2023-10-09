import { ElementClass } from "../../../src/binding/nodePoperty/ElementClass.js";

test("ElementClass", () => {
  const element = document.createElement("div");
  const elementClass = new ElementClass(element, "class.selected", [], {});
  expect(elementClass.className).toBe("selected");
  expect(elementClass.value).toBe(false);

  element.className = "selected";
  expect(elementClass.value).toBe(true);

  element.className = "fugafuga selected hogehoge";
  expect(elementClass.value).toBe(true);

  elementClass.value = false;
  expect(element.className).toBe("fugafuga hogehoge");

  elementClass.value = true;
  expect(element.className).toBe("fugafuga hogehoge selected");
});