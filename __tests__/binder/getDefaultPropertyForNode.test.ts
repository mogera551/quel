import "jest";
import { getDefaultPropertyForNode } from "../../src/binder/getDefaultPropertyForNode";

describe("getDefaultPropertyForNode", () => {
  it("should return 'value' for HTMLInputElement of type text", () => {
    const input = document.createElement("input");
    input.type = "text";
    const result = getDefaultPropertyForNode(input, "HTMLElement");
    expect(result).toBe("value");
  });

  it("should return 'checked' for HTMLInputElement of type checkbox", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    const result = getDefaultPropertyForNode(input, "HTMLElement");
    expect(result).toBe("checked");
  });

  it("should return 'onclick' for HTMLButtonElement", () => {
    const button = document.createElement("button");
    const result = getDefaultPropertyForNode(button, "HTMLElement");
    expect(result).toBe("onclick");
  });

  it("should return 'onclick' for HTMLAnchorElement", () => {
    const anchor = document.createElement("a");
    const result = getDefaultPropertyForNode(anchor, "HTMLElement");
    expect(result).toBe("onclick");
  });

  it("should return 'onsubmit' for HTMLFormElement", () => {
    const form = document.createElement("form");
    const result = getDefaultPropertyForNode(form, "HTMLElement");
    expect(result).toBe("onsubmit");
  });

  it("should return 'value' for HTMLSelectElement", () => {
    const select = document.createElement("select");
    const result = getDefaultPropertyForNode(select, "HTMLElement");
    expect(result).toBe("value");
  });

  it("should return 'value' for HTMLTextAreaElement", () => {
    const textarea = document.createElement("textarea");
    const result = getDefaultPropertyForNode(textarea, "HTMLElement");
    expect(result).toBe("value");
  });

  it("should return 'value' for HTMLOptionElement", () => {
    const option = document.createElement("option");
    const result = getDefaultPropertyForNode(option, "HTMLElement");
    expect(result).toBe("value");
  });

  it("should return 'textContent' for HMLDivElement", () => {
    const div = document.createElement("div");
    const result = getDefaultPropertyForNode(div, "HTMLElement");
    expect(result).toBe("textContent");
  });

  it("should return 'textContent' for Text node", () => {
    const textNode = document.createTextNode("sample text");
    const result = getDefaultPropertyForNode(textNode, "Text");
    expect(result).toBe("textContent");
  });

  it("should return undefined for SVGElement", () => {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const result = getDefaultPropertyForNode(svgElement, "SVGElement");
    expect(result).toBeUndefined();
  });

  it("should return undefined for Template element", () => {
    const template = document.createComment("@@:sample comment");
    const result = getDefaultPropertyForNode(template, "Template");
    expect(result).toBeUndefined();
  });
});