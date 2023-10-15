import { ElementStyle } from "../../../src/binding/nodePoperty/ElementStyle.js";

test("ElementStyle", () => {
  const element = document.createElement("div");
  element.style["width"] = "100px";
  const elementStyle = new ElementStyle(element, "style.width", [], {});
  expect(elementStyle.styleName).toBe("width");
  expect(elementStyle.value).toBe("100px");
  expect(elementStyle.applicable).toBe(true);
  expect(element.style["width"]).toBe("100px");

  elementStyle.value = "200px";
  expect(elementStyle.value).toBe("200px");
  expect(element.style["width"]).toBe("200px");

  expect(() => {
    const node = document.createTextNode("abc");
    const elementStyle = new ElementStyle(node, "style.width", [], {});
  }).toThrow("not htmlElement")
});