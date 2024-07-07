import {expect, jest, test} from '@jest/globals';

const { NodeType } = await import("../../src/newBinder/nodeType.js");
const { getDefaultProperty } = await import("../../src/newBinder/defaultProperty.js");

describe("getDefaultProperty", () => {
    it("should return textContent from Text", () => {
      const node = document.createTextNode("content");
      expect(getDefaultProperty(node, NodeType.Text)).toBe("textContent");
    });
    it("should return undefined from SVGElement", () => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      expect(getDefaultProperty(node, NodeType.SVGElement)).toBeUndefined();
    });
    it("should return undefined from SVGElement", () => {
      const node = document.createElement("template");
      expect(getDefaultProperty(node, NodeType.Template)).toBeUndefined();
    });
    it("should return textContent from HTMLElement", () => {
      const node = document.createElement("div");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("textContent");
    });
    it("should return value from HTMLSelectElement", () => {
      const node = document.createElement("select");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("value");
    });
    it("should return value from HTMLTextAreaElement", () => {
      const node = document.createElement("textarea");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("value");
    });
    it("should return value from HTMLOptionElement", () => {
      const node = document.createElement("option");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("value");
    });
    it("should return onclick from HTMLButtonElement", () => {
      const node = document.createElement("button");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("onclick");
    });
    it("should return onclick from HTMLAnchorElement", () => {
      const node = document.createElement("a");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("onclick");
    });
    it("should return onsubmit from HTMLFormElement", () => {
      const node = document.createElement("form");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("onsubmit");
    });
    it("should return value from HTMLInputElement", () => {
      const node = document.createElement("input");
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("value");
    });
    it("should return checked from HTMLInputElement type radio", () => {
      const node = document.createElement("input");
      node.type = "radio";
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("checked");
    });
    it("should return checked from HTMLInputElement type checkbox", () => {
      const node = document.createElement("input");
      node.type = "checkbox";
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("checked");
    });
    it("should return value from HTMLInputElement type button", () => {
      const node = document.createElement("input");
      node.type = "button";
      expect(getDefaultProperty(node, NodeType.HTMLElement)).toBe("onclick");
    });

});
