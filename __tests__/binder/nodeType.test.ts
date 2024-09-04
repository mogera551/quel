import "jest";
import { getNodeType } from "../../src/binder/nodeType";

describe("nodeType", () => {
  it("Text", () => {
    const text = document.createComment("@@:");
    expect(getNodeType(text)).toBe("Text");
  });
  it("HTMLElement", () => {
    const div = document.createElement("div");
    expect(getNodeType(div)).toBe("HTMLElement");
  });
  it("Template", () => {
    const template = document.createComment("@@|");
    expect(getNodeType(template)).toBe("Template");
  });
  it("SVGElement", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    expect(getNodeType(svg)).toBe("SVGElement");
  });
  it("Unknown", () => {
    const unknown = document.createComment("@@?");
    expect(() => getNodeType(unknown)).toThrow("Unknown NodeType: 8");
    const unknown2 = document.createComment("@@");
    expect(() => getNodeType(unknown2)).toThrow("Unknown NodeType: 8");
  });
  it("Cache Text", () => {
    const text = document.createComment("@@:");
    expect(getNodeType(text)).toBe("Text");
    const text2 = document.createComment("@@:");
    expect(getNodeType(text2)).toBe("Text");
  });
});