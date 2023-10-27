import { NodeProperty } from "../../../src/binding/nodePoperty/NodeProperty.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

const binding = {};

test("NodeProperty property access", () => {
  const node = document.createTextNode("abc");
  {
    const nodeProperty = new NodeProperty(binding, node, "aaaa", [], {});
    expect(nodeProperty.binding).toBe(binding);
    expect(nodeProperty.node).toBe(node);
    expect(nodeProperty.name).toBe("aaaa");
    expect(nodeProperty.nameElements).toEqual(["aaaa"]);
    expect(nodeProperty.filters).toEqual([]);
    expect(nodeProperty.filterFuncs).toEqual({});
    expect(nodeProperty.applicable).toBe(true);
  }
  {
    const nodeProperty = new NodeProperty(binding, node, "aaaa.bbbb", [], {});
    expect(nodeProperty.binding).toBe(binding);
    expect(nodeProperty.node).toBe(node);
    expect(nodeProperty.name).toBe("aaaa.bbbb");
    expect(nodeProperty.nameElements).toEqual(["aaaa", "bbbb"]);
    expect(nodeProperty.filters).toEqual([]);
    expect(nodeProperty.filterFuncs).toEqual({});
    expect(nodeProperty.applicable).toBe(true);
  }
  {
    const nodeProperty = new NodeProperty(binding, node, "aaaa.*.bbbb", [], {});
    expect(nodeProperty.binding).toBe(binding);
    expect(nodeProperty.node).toBe(node);
    expect(nodeProperty.name).toBe("aaaa.*.bbbb");
    expect(nodeProperty.nameElements).toEqual(["aaaa", "*", "bbbb"]);
    expect(nodeProperty.filters).toEqual([]);
    expect(nodeProperty.filterFuncs).toEqual({});
    expect(nodeProperty.applicable).toBe(true);
  }
});

test("NodeProperty property value", () => {
  const node = document.createTextNode("abc");
  const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
  expect(nodeProperty.value).toBe("abc");
  expect(nodeProperty.filteredValue).toBe("abc");
  expect(node.textContent).toBe("abc");

  nodeProperty.value = "def";
  expect(nodeProperty.value).toBe("def");
  expect(nodeProperty.filteredValue).toBe("def");
  expect(node.textContent).toBe("def");
});

test("NodeProperty property filtered value", () => {
  const node = document.createTextNode("123");
  const nodeProperty = new NodeProperty(binding, node, "textContent", [{name:"number", options:[]}], inputFilters);
  expect(nodeProperty.value).toBe("123");
  expect(nodeProperty.filteredValue).toBe(123);
  expect(node.textContent).toBe("123");

  nodeProperty.value = "456";
  expect(nodeProperty.value).toBe("456");
  expect(nodeProperty.filteredValue).toBe(456);
  expect(node.textContent).toBe("456");
});

test("NodeProperty fail", () => {
  expect(() => {
    const nodeProperty = new NodeProperty(binding, {}, "aaaa", [], {});
  }).toThrow("not Node");
})