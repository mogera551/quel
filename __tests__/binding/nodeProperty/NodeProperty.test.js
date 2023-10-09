import { NodeProperty } from "../../../src/binding/nodePoperty/NodeProperty.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

test("NodeProperty property access", () => {
  const node = document.createTextNode("abc");
  {
    const nodeProperty = new NodeProperty(node, "aaaa", [], {});
    expect(nodeProperty.node).toBe(node);
    expect(nodeProperty.name).toBe("aaaa");
    expect(nodeProperty.nameElements).toEqual(["aaaa"]);
    expect(nodeProperty.filters).toEqual([]);
    expect(nodeProperty.filterFuncs).toEqual({});
  }
  {
    const nodeProperty = new NodeProperty(node, "aaaa.bbbb", [], {});
    expect(nodeProperty.name).toBe("aaaa.bbbb");
    expect(nodeProperty.nameElements).toEqual(["aaaa", "bbbb"]);
  }
  {
    const nodeProperty = new NodeProperty(node, "aaaa.*.bbbb", [], {});
    expect(nodeProperty.name).toBe("aaaa.*.bbbb");
    expect(nodeProperty.nameElements).toEqual(["aaaa", "*", "bbbb"]);
  }
});

test("NodeProperty property value", () => {
  const node = document.createTextNode("abc");
  const nodeProperty = new NodeProperty(node, "textContent", [], {});
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
  const nodeProperty = new NodeProperty(node, "textContent", [{name:"number", option:[]}], inputFilters);
  expect(nodeProperty.value).toBe("123");
  expect(nodeProperty.filteredValue).toBe(123);
  expect(node.textContent).toBe("123");

  nodeProperty.value = "456";
  expect(nodeProperty.value).toBe("456");
  expect(nodeProperty.filteredValue).toBe(456);
  expect(node.textContent).toBe("456");
});

