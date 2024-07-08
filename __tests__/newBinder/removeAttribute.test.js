import {expect, jest, test} from '@jest/globals';

import { removeAttribute } from "../../src/newBinder/removeAttribute.js";
import { NodeType } from "../../src/newBinder/nodeType.js";

describe("removeAttribute", () => {
  it("should remove data-bind attribute from HTMLElement", () => {
    const node = document.createElement("div");
    node.setAttribute("data-bind", "value");
    expect(node.hasAttribute("data-bind")).toBe(true);
    removeAttribute(node, NodeType.HTMLElement);
    expect(node.hasAttribute("data-bind")).toBe(false);
  });
  it("should remove data-bind attribute from SVGElement", () => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    node.setAttribute("data-bind", "value");
    expect(node.hasAttribute("data-bind")).toBe(true);
    removeAttribute(node, NodeType.SVGElement);
    expect(node.hasAttribute("data-bind")).toBe(false);
  });
  it("should not remove data-bind attribute from Text", () => {
    const node = document.createElement("div");
    node.setAttribute("data-bind", "value");
    expect(node.hasAttribute("data-bind")).toBe(true);
    removeAttribute(node, NodeType.Text);
    expect(node.hasAttribute("data-bind")).toBe(true);
  });
  it("should not remove data-bind attribute from Template", () => {
    const node = document.createElement("div");
    node.setAttribute("data-bind", "value");
    expect(node.hasAttribute("data-bind")).toBe(true);
    removeAttribute(node, NodeType.Template);
    expect(node.hasAttribute("data-bind")).toBe(true);
  });
});