import {expect, jest, test} from '@jest/globals';

import { replaceTextNode } from "../../src/newBinder/replaceTextNode.js";
import { NodeType } from "../../src/newBinder/nodeType.js";

describe("replaceTextNode", () => {
  it("should replace text node with NodeType.Text", () => {
    const node = document.createComment("text");
    const parent = document.createElement("div");
    parent.appendChild(node);
    expect(parent.childNodes[0]).toBe(node);
    replaceTextNode(node, NodeType.Text);
    expect(parent.childNodes[0].nodeType).toBe(node.TEXT_NODE);
  });
  it("should not replace text node with NodeType.HTMLElement", () => {
    const node = document.createComment("text");
    const parent = document.createElement("div");
    parent.appendChild(node);
    expect(parent.childNodes[0]).toBe(node);
    replaceTextNode(node, NodeType.HTMLElement);
    expect(parent.childNodes[0]).toBe(node);
  });
  it("should not replace text node with NodeType.SVGElement", () => {
    const node = document.createComment("text");
    const parent = document.createElement("div");
    parent.appendChild(node);
    expect(parent.childNodes[0]).toBe(node);
    replaceTextNode(node, NodeType.SVGElement);
    expect(parent.childNodes[0]).toBe(node);
  });
  it("should not replace text node with NodeType.Template", () => {
    const node = document.createComment("text");
    const parent = document.createElement("div");
    parent.appendChild(node);
    expect(parent.childNodes[0]).toBe(node);
    replaceTextNode(node, NodeType.Template);
    expect(parent.childNodes[0]).toBe(node);
  });
});