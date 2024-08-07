import {expect, jest, test} from '@jest/globals';

import { NodeType, getNodeType, nodeTypeByNodeKey } from "../../src/newBinder/nodeType.js";

describe("getNodeType", () => {
  it("should return NodeType.HTMLElement", () => {
    const node = document.createElement("div");
    expect(getNodeType(node)).toBe(NodeType.HTMLElement);
  });
  it("should return NodeType.HTMLElement", () => {
    const node = document.createElement("div");
    expect(getNodeType(node)).toBe(NodeType.HTMLElement);
  });
  it("should return NodeType.SVGElement", () => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    expect(getNodeType(node)).toBe(NodeType.SVGElement);
  });
  it("should return NodeType.Template", () => {
    const node = document.createComment("@@|");
    expect(getNodeType(node)).toBe(NodeType.Template);
  });
  it("should throw Unknown NodeType", () => {
    const node = document.createComment("@@:");
    expect(getNodeType(node)).toBe(NodeType.Text);
  });
  it("should throw Unknown NodeType", () => {
    const node = document.createComment("@@");
    expect(() => getNodeType(node)).toThrow();
  });
  it("should throw Unknown NodeType", () => {
    const node = document.createTextNode("text");
    expect(() => getNodeType(node)).toThrow();
  });

});