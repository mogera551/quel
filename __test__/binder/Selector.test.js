import { jest } from '@jest/globals';
import { Selector } from '../../src/binder/Selector.js';


describe("src/binder/Selector.js", () => {
  test("undefined template", () => {
    const template = document.createElement("template");
    template.innerHTML = `<div></div>`;
    const rootElement = template.content.cloneNode(true);
    expect(() => {
      Selector.getTargetNodes(undefined, rootElement);
    }).toThrow("Selector: template is undefined");
  });
  test("undefined rootElement", () => {
    const template = document.createElement("template");
    template.innerHTML = `<div></div>`;
    const rootElement = template.content.cloneNode(true);
    expect(() => {
      Selector.getTargetNodes(template, undefined);
    }).toThrow("Selector: rootElement is undefined");
  });
  test("empty", () => {
    const template = document.createElement("template");
    template.innerHTML = `<div></div>`;
    const rootElement = template.content.cloneNode(true);
    const nodes = Selector.getTargetNodes(template, rootElement);
    expect(nodes.length).toBe(0);
  });
  test("combined", () => {
    const template = document.createElement("template");
    template.innerHTML = `<div></div><input type="text" data-bind="value:value"><!--@@:value--><!--@@|xxxx-xxxxx-xxxxx--><!--@@|xxxx-xxxxx-xxxxx--><!-- test -->`;
    {
      const rootElement = template.content.cloneNode(true);
      const nodes = Selector.getTargetNodes(template, rootElement);
      expect(nodes.length).toBe(4);
      expect(rootElement.childNodes[1]).toBe(nodes[0]);
      expect(rootElement.childNodes[2]).toBe(nodes[1]);
      expect(rootElement.childNodes[3]).toBe(nodes[2]);
      expect(rootElement.childNodes[4]).toBe(nodes[3]);
      expect(Selector.listOfRouteIndexesByTemplate.get(template).length).toBe(4);
      expect(Selector.listOfRouteIndexesByTemplate.get(template)[0]).toEqual([1]);
      expect(Selector.listOfRouteIndexesByTemplate.get(template)[1]).toEqual([2]);
      expect(Selector.listOfRouteIndexesByTemplate.get(template)[2]).toEqual([3]);
      expect(Selector.listOfRouteIndexesByTemplate.get(template)[3]).toEqual([4]);
    }
    {
      const rootElement = template.content.cloneNode(true);
      const nodes = Selector.getTargetNodes(template, rootElement);
      expect(nodes.length).toBe(4);
      expect(rootElement.childNodes[1]).toBe(nodes[0]);
      expect(rootElement.childNodes[2]).toBe(nodes[1]);
      expect(rootElement.childNodes[3]).toBe(nodes[2]);
      expect(rootElement.childNodes[4]).toBe(nodes[3]);
    }
  });
  test("combined", () => {
    const template = document.createElement("template");
    template.innerHTML = `
<div><!--@@:xxxx-xxxxx-xxxxx--></div>
    `;
    {
      const rootElement = template.content.cloneNode(true);
      const nodes = Selector.getTargetNodes(template, rootElement);
      expect(nodes.length).toBe(1);
      expect(rootElement.querySelector("div").childNodes[0]).toBe(nodes[0]);
      expect(Selector.listOfRouteIndexesByTemplate.get(template).length).toBe(1);
      expect(Selector.listOfRouteIndexesByTemplate.get(template)[0]).toEqual([1, 0]);
    }
    {
      const rootElement = template.content.cloneNode(true);
      const nodes = Selector.getTargetNodes(template, rootElement);
      expect(nodes.length).toBe(1);
      expect(rootElement.querySelector("div").childNodes[0]).toBe(nodes[0]);
    }
  });
});
