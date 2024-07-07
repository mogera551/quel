
import {expect, jest, test} from '@jest/globals';

const { NodeType } = await import("../../src/newBinder/nodeType.js");
const { isInputable } = await import("../../src/newBinder/isInputable.js");

describe("isInputable", () => {
    it("should return true if inputable element", () => {
      const node = document.createElement("input");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(true);
    });
    it("should return true if inputable element", () => {
      const node = document.createElement("textarea");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(true);
    });
    it("should return true if inputable element", () => {
      const node = document.createElement("select");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(true);
    });
    it("should return false if not inputable element", () => {
      const node = document.createElement("div");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(false);
    });
    it("should return false if not inputable element", () => {
      const node = document.createElement("span");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(false);
    });
    it("should return false if not inputable element", () => {
      const node = document.createElement("a");
      expect(isInputable(node, NodeType.HTMLElement)).toBe(false);
    });
    it("should return false if inputable element, NodeType.SVGElement", () => {
      const node = document.createElement("input");
      expect(isInputable(node, NodeType.SVGElement)).toBe(false);
    });
    it("should return false if inputable element, NodeType.Template", () => {
      const node = document.createElement("input");
      expect(isInputable(node, NodeType.Template)).toBe(false);
    });
    it("should return false if inputable element, NodeType.Text", () => {
      const node = document.createElement("input");
      expect(isInputable(node, NodeType.Text)).toBe(false);
    });

});
