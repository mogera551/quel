import { jest } from '@jest/globals';
import { Binder } from "../../src/binder/Binder.js";
import { BindToHTMLElement } from '../../src/binder/BindToHTMLElement.js';
import { BindToSVGElement } from '../../src/binder/BindToSVGElement.js';
import { BindToText } from '../../src/binder/BindToText.js';
import { BindToTemplate } from '../../src/binder/BindToTemplate.js';

const BindToHTMLElement_bind = jest.spyOn(BindToHTMLElement, "bind").mockImplementation((bindingManager, node) => {
  return {kind:"element"};
});
const BindToSVGElement_bind = jest.spyOn(BindToSVGElement, "bind").mockImplementation((bindingManager, node) => {
  return {kind:"svg"};
});
const BindToText_bind = jest.spyOn(BindToText, "bind").mockImplementation((bindingManager, node) => {
  return {kind:"text"};
});
const BindToTemplate_bind = jest.spyOn(BindToTemplate, "bind").mockImplementation((bindingManager, node) => {
  return {kind:"template"};
});

describe("src/binder/Binder.js", () => {
  const bindingManager = {
    component: {
      viewModel: {
        value:100,
        value2:200,
        values:[100,200,300],
        values2:[1000,2000,3000,4000],
        points: "0,0 20,10 10,20"
      },
      filters: {
        in:{}, out:{}
      }
    }
  }
  test("empty", () =>{
    const nodes = Binder.bind(bindingManager, []);
    expect(nodes).toEqual([]);
  });
  test("BindToHTMLElement node x 1", () =>{
    BindToHTMLElement_bind.mockClear();
    const div = document.createElement("div");
    div.setAttribute("data-bind", "textContent:value")
    const nodes = Binder.bind(bindingManager, [div]);
    expect(BindToHTMLElement_bind.mock.calls.length).toBe(1);
    expect(BindToHTMLElement_bind.mock.calls[0]).toEqual([bindingManager, div]);
    expect(nodes).toEqual([{kind:"element"}]);
  });
  test("BindToHTMLElement node x 2", () =>{
    BindToHTMLElement_bind.mockClear();
    const div1 = document.createElement("div");
    div1.setAttribute("data-bind", "textContent:value");
    const div2 = document.createElement("div");
    div2.setAttribute("data-bind", "textContent:value2");
    const nodes = Binder.bind(bindingManager, [div1, div2]);
    expect(BindToHTMLElement_bind.mock.calls.length).toBe(2);
    expect(BindToHTMLElement_bind.mock.calls[0]).toEqual([bindingManager, div1]);
    expect(BindToHTMLElement_bind.mock.calls[1]).toEqual([bindingManager, div2]);
    expect(nodes).toEqual([{kind:"element"}, {kind:"element"}]);
  });
  test("BindToText node x 1", () =>{
    BindToText_bind.mockClear();
    const comment = document.createComment("@@:value");
    const nodes = Binder.bind(bindingManager, [comment]);
    expect(BindToText_bind.mock.calls.length).toBe(1);
    expect(BindToText_bind.mock.calls[0]).toEqual([bindingManager, comment]);
    expect(nodes).toEqual([{kind:"text"}]);
  });
  test("BindToText node x 2", () =>{
    BindToText_bind.mockClear();
    const comment = document.createComment("@@:value");
    const comment2 = document.createComment("@@:value2");
    const nodes = Binder.bind(bindingManager, [comment, comment2]);
    expect(BindToText_bind.mock.calls.length).toBe(2);
    expect(BindToText_bind.mock.calls[0]).toEqual([bindingManager, comment]);
    expect(BindToText_bind.mock.calls[1]).toEqual([bindingManager, comment2]);
    expect(nodes).toEqual([{kind:"text"},{kind:"text"}]);
  });
  test("BindToTemplate node x 1", () =>{
    BindToTemplate_bind.mockClear();
    const template = document.createComment("@@|values");
    const nodes = Binder.bind(bindingManager, [template]);
    expect(BindToTemplate_bind.mock.calls.length).toBe(1);
    expect(BindToTemplate_bind.mock.calls[0]).toEqual([bindingManager, template]);
    expect(nodes).toEqual([{kind:"template"}]);
  });
  test("BindToTemplate node x 2", () =>{
    BindToTemplate_bind.mockClear();
    const template = document.createComment("@@|values");
    const template2 = document.createComment("@@|values2");
    const nodes = Binder.bind(bindingManager, [template, template2]);
    expect(BindToTemplate_bind.mock.calls.length).toBe(2);
    expect(BindToTemplate_bind.mock.calls[0]).toEqual([bindingManager, template]);
    expect(BindToTemplate_bind.mock.calls[1]).toEqual([bindingManager, template2]);
    expect(nodes).toEqual([{kind:"template"},{kind:"template"}]);
  });
  test("BindToSVGElement node x 1", () =>{
    BindToSVGElement_bind.mockClear();
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("data-bind", "attr.points:points")
    const nodes = Binder.bind(bindingManager, [polygon]);
    expect(BindToSVGElement_bind.mock.calls.length).toBe(1);
    expect(BindToSVGElement_bind.mock.calls[0]).toEqual([bindingManager, polygon]);
    expect(nodes).toEqual([{kind:"svg"}]);
  });
  test("BindToSVGElement node x 2", () =>{
    BindToSVGElement_bind.mockClear();
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("data-bind", "attr.points:points")
    const polygon2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon2.setAttribute("data-bind", "attr.points:points")
    const nodes = Binder.bind(bindingManager, [polygon, polygon2]);
    expect(BindToSVGElement_bind.mock.calls.length).toBe(2);
    expect(BindToSVGElement_bind.mock.calls[0]).toEqual([bindingManager, polygon]);
    expect(BindToSVGElement_bind.mock.calls[1]).toEqual([bindingManager, polygon2]);
    expect(nodes).toEqual([{kind:"svg"},{kind:"svg"}]);
  });
  test("fail textNode", () =>{
    const textNode = document.createTextNode("@@:value");
    expect(() => {
      Binder.bind(bindingManager, [textNode]);
    }).toThrow("Binder: unknown node type");
  });
  test("fail Comment", () =>{
    const comment = document.createComment("@@@values");
    expect(() => {
      Binder.bind(bindingManager, [comment]);
    }).toThrow("Binder: unknown node type");
  });
  test("mix node 1 x 4", () =>{
    BindToHTMLElement_bind.mockClear();
    BindToSVGElement_bind.mockClear();
    BindToText_bind.mockClear();
    BindToTemplate_bind.mockClear();
    const div = document.createElement("div");
    div.setAttribute("data-bind", "textContent:value");
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("data-bind", "attr.points:points")
    const comment = document.createComment("@@:value");
    const template = document.createComment("@@|values");
    const nodes = Binder.bind(bindingManager, [div, polygon, comment, template]);
    expect(BindToHTMLElement_bind.mock.calls.length).toBe(1);
    expect(BindToHTMLElement_bind.mock.calls[0]).toEqual([bindingManager, div]);
    expect(BindToSVGElement_bind.mock.calls.length).toBe(1);
    expect(BindToSVGElement_bind.mock.calls[0]).toEqual([bindingManager, polygon]);
    expect(BindToText_bind.mock.calls.length).toBe(1);
    expect(BindToText_bind.mock.calls[0]).toEqual([bindingManager, comment]);
    expect(BindToTemplate_bind.mock.calls.length).toBe(1);
    expect(BindToTemplate_bind.mock.calls[0]).toEqual([bindingManager, template]);
    expect(nodes).toEqual([{kind:"element"},{kind:"svg"},{kind:"text"},{kind:"template"}]);
  });
  test("mix node 2 x 4", () =>{
    BindToHTMLElement_bind.mockClear();
    BindToSVGElement_bind.mockClear();
    BindToText_bind.mockClear();
    BindToTemplate_bind.mockClear();
    const div1 = document.createElement("div");
    div1.setAttribute("data-bind", "textContent:value");
    const div2 = document.createElement("div");
    div2.setAttribute("data-bind", "textContent:value2");
    const polygon1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon1.setAttribute("data-bind", "attr.points:points")
    const polygon2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon2.setAttribute("data-bind", "attr.points:points")
    const comment1 = document.createComment("@@:value");
    const comment2 = document.createComment("@@:value2");
    const template1 = document.createComment("@@|values");
    const template2 = document.createComment("@@|values2");
    const nodes = Binder.bind(bindingManager, [div1, div2, polygon1, polygon2, comment1, comment2, template1, template2]);
    expect(BindToHTMLElement_bind.mock.calls.length).toBe(2);
    expect(BindToHTMLElement_bind.mock.calls[0]).toEqual([bindingManager, div1]);
    expect(BindToHTMLElement_bind.mock.calls[1]).toEqual([bindingManager, div2]);
    expect(BindToSVGElement_bind.mock.calls.length).toBe(2);
    expect(BindToSVGElement_bind.mock.calls[0]).toEqual([bindingManager, polygon1]);
    expect(BindToSVGElement_bind.mock.calls[1]).toEqual([bindingManager, polygon2]);
    expect(BindToText_bind.mock.calls.length).toBe(2);
    expect(BindToText_bind.mock.calls[0]).toEqual([bindingManager, comment1]);
    expect(BindToText_bind.mock.calls[1]).toEqual([bindingManager, comment2]);
    expect(BindToTemplate_bind.mock.calls.length).toBe(2);
    expect(BindToTemplate_bind.mock.calls[0]).toEqual([bindingManager, template1]);
    expect(BindToTemplate_bind.mock.calls[1]).toEqual([bindingManager, template2]);
    expect(nodes).toEqual([{kind:"element"},{kind:"element"},{kind:"svg"},{kind:"svg"},{kind:"text"},{kind:"text"},{kind:"template"},{kind:"template"}]);
  });

})
