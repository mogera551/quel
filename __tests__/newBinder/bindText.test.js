import {expect, jest, test} from '@jest/globals';

jest.unstable_mockModule('../../src/component/Template.js', () => {
  const template = document.createElement("template");
  template.dataset.bind = "aaaaa";
  const template2 = document.createElement("template");
  return {
    getByUUID: (uuid) => uuid === "UUID" ? template : (uuid === "UUID2" ? template2 : undefined)
  }
});
const { getBindText } = await import("../../src/newBinder/bindText.js");
const { NodeType } = await import("../../src/newBinder/nodeType.js");

describe("getBindText", () => {

  it("should return data-bind attribute value from HTMLElement", () => {
    const node = document.createElement("div");
    node.dataset.bind = "content";
    expect(getBindText(node, NodeType.HTMLElement)).toBe("content");
  });
  it("should return data-bind attribute value from SVGElement", () => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    node.dataset.bind = "content";
    expect(getBindText(node, NodeType.SVGElement)).toBe("content");
  });
  it("should return textContent value from Text", () => {
    const node = document.createTextNode("@@:content");
    expect(getBindText(node, NodeType.Text)).toBe("content");
  });
  it("should return data-bind attribute value from Template", () => {
    const node = document.createTextNode("@@|UUID");
    expect(getBindText(node, NodeType.Template)).toBe("aaaaa");
  });
  it("should return empty string if no data-bind attribute", () => {
    const node = document.createElement("div");
    expect(getBindText(node, NodeType.HTMLElement)).toBe("");
  });
  it("should return empty string if no data-bind attribute", () => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    expect(getBindText(node, NodeType.SVGElement)).toBe("");
  });
  it("should return empty string if no textContent", () => {
    const node = document.createTextNode("");
    expect(getBindText(node, NodeType.Text)).toBe("");
  });
  it("should return empty string if no data-bind attribute in Template", () => {
    const node = document.createTextNode("@@|uuid");
    expect(getBindText(node, NodeType.Template)).toBe("");
  });
  it("should return empty string if no data-bind attribute in Template", () => {
    const node = document.createTextNode("@@|UUID2");
    expect(getBindText(node, NodeType.Template)).toBe("");
  });
});