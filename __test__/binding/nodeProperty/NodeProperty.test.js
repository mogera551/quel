import { jest } from '@jest/globals';
import { NodeProperty } from '../../../src/binding/nodeProperty/NodeProperty.js';
import { inputFilters, outputFilters } from '../../../src/filter/Builtin.js';
import { Filter } from '../../../src/filter/Filter.js';

describe('src/binding/nodeProperty/NodeProperty.NodeProperty', () => {
  const binding = {

  };
  test("construtor normal", () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    expect(nodeProperty.node).toBe(node);
    expect(nodeProperty.name).toBe("textContent");
    expect(nodeProperty.value).toBe("text");
    expect(nodeProperty.filteredValue).toBe("text");
    expect(nodeProperty.filters).toEqual([]);
    expect(nodeProperty.filterFuncs).toEqual({});
    expect(nodeProperty.nameElements).toEqual(["textContent"]);
    expect(nodeProperty.applicable).toBe(true);
    expect(nodeProperty.binding).toBe(binding);
    expect(nodeProperty.expandable).toBe(false);
    expect(nodeProperty.isSelectValue).toBe(false);
  });

  test("constructor raise", () => {
    expect(() => {
      new NodeProperty(binding, {}, "textContent", [], {});
    }).toThrow("NodeProperty: not Node");
  });

  test("isSameValue", () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    expect(nodeProperty.isSameValue("text")).toBe(true);
    expect(nodeProperty.isSameValue("text2")).toBe(false);
  });

  test("initialize", () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    nodeProperty.initialize();
  });

  test("postUpdate", () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    nodeProperty.postUpdate(new Map());
  });

  test("applyToChildNodes", () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    nodeProperty.applyToChildNodes(new Set());
  });

  test("clearValue" , () => {
    const node = document.createTextNode("text");
    const nodeProperty = new NodeProperty(binding, node, "textContent", [], {});
    nodeProperty.clearValue();
  });

  test("construtor filter", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = "123";
    const filter = Object.assign(new Filter(), {name:"number", options:[]});
    const nodeProperty = new NodeProperty(binding, input, "value", [filter], {number:inputFilters.number});
    expect(nodeProperty.node).toBe(input);
    expect(nodeProperty.name).toBe("value");
    expect(nodeProperty.value).toBe("123");
    expect(nodeProperty.filteredValue).toBe(123);
    expect(nodeProperty.filters).toEqual([filter]);
    expect(nodeProperty.filterFuncs).toEqual({number:inputFilters.number});
    expect(nodeProperty.nameElements).toEqual(["value"]);
    expect(nodeProperty.applicable).toBe(true);
    expect(nodeProperty.binding).toBe(binding);
    expect(nodeProperty.expandable).toBe(false);
    expect(nodeProperty.isSelectValue).toBe(false);
  });
});
