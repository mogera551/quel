import { ElementStyle } from "../../../src/binding/nodeProperty/ElementStyle.js";

const binding = {};

test("ElementStyle", () => {
  const element = document.createElement("div");
  element.style["width"] = "100px";
  const elementStyle = new ElementStyle(binding, element, "style.width", [], {});
  expect(elementStyle.binding).toBe(binding);
  expect(elementStyle.node).toBe(element);
  expect(elementStyle.element).toBe(element);
  expect(elementStyle.name).toBe("style.width");
  expect(elementStyle.nameElements).toEqual(["style", "width"]);
  expect(elementStyle.filters).toEqual([]);
  expect(elementStyle.filterFuncs).toEqual({});
  expect(elementStyle.value).toBe("100px");
  expect(elementStyle.filteredValue).toBe("100px");
  expect(elementStyle.applicable).toBe(true);
  expect(elementStyle.styleName).toBe("width");
  expect(elementStyle.expandable).toBe(false);

  expect(element.style["width"]).toBe("100px");

  elementStyle.value = "200px";
  expect(elementStyle.value).toBe("200px");
  expect(element.style["width"]).toBe("200px");

  expect(() => {
    const node = document.createTextNode("abc");
    const elementStyle = new ElementStyle(binding, node, "style.width", [], {});
  }).toThrow("not htmlElement")
});