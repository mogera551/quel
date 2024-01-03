import { jest } from '@jest/globals';
import { BindToDom } from '../../src/binder/BindToDom.js';
import { Radio } from '../../src/binding/nodeProperty/Radio.js';
import { Checkbox } from '../../src/binding/nodeProperty/Checkbox.js';
import { Binding } from '../../src/binding/Binding';
import { ElementProperty } from '../../src/binding/nodeProperty/ElementProperty';
import { ElementEvent } from '../../src/binding/nodeProperty/ElementEvent.js';
import { ViewModelProperty } from '../../src/binding/viewModelProperty/ViewModelProperty';
import { Branch } from '../../src/binding/nodeProperty/Branch.js';
import { Repeat } from '../../src/binding/nodeProperty/Repeat.js';
import { NodeProperty } from '../../src/binding/nodeProperty/NodeProperty.js';
import { BindToText } from '../../src/binder/BindToText.js';

const BindToDom_parseBindText = jest.spyOn(BindToDom, "parseBindText").mockImplementation((bindingManager, node, viewModel, text, defaultName) => {
  (typeof text === "undefined") && utils.raise(`BindToDom: text is undefined`);
  if (text.trim() === "") return [];
  return text.split(";").map(expr => {
    const [exprs1, exprs2] = expr.trim().split(":", 2);
    const [nodeProperty, viewModelPropertyAndFilters] = exprs2 ? [exprs1, exprs2] : [defaultName, exprs1];

    const [viewModelProperty, ...filters] = viewModelPropertyAndFilters.split("|");
    return {
      nodeProperty, viewModelProperty, filters
    }
  }).map(info => {
    if (info.nodeProperty === "radio") {
      return new Binding(bindingManager, node, info.nodeProperty, Radio, info.viewModelProperty, ViewModelProperty, info.filters);
    } else if (info.nodeProperty === "checkbox") {
      return new Binding(bindingManager, node, info.nodeProperty, Checkbox, info.viewModelProperty, ViewModelProperty, info.filters);
    } else if (info.nodeProperty.startsWith("on")) {
      return new Binding(bindingManager, node, info.nodeProperty, ElementEvent, info.viewModelProperty, ViewModelProperty, info.filters);
    } else if (node instanceof Comment && info.nodeProperty === "if") {
      return new Binding(bindingManager, node, info.nodeProperty, Branch, info.viewModelProperty, ViewModelProperty, info.filters);
    } else if (node instanceof Comment && info.nodeProperty === "loop") {
      return new Binding(bindingManager, node, info.nodeProperty, Repeat, info.viewModelProperty, ViewModelProperty, info.filters);
    } else if (node instanceof Element) {
      return new Binding(bindingManager, node, info.nodeProperty, ElementProperty, info.viewModelProperty, ViewModelProperty, info.filters);
    } else {
      return new Binding(bindingManager, node, info.nodeProperty, NodeProperty, info.viewModelProperty, ViewModelProperty, info.filters);
    }
  });
});

describe("src/binder/BindToText.js", () => {
  const bindingManager = {
    component: {
      viewModel: {
        value:100,
        value2:200,
        values:[100,200,300],
        values2:[1000,2000,3000,4000],
        points: "0,0 20,10 10,20",
        checked:true,
        click: () => {}
      },
      filters: {
        in:{}, out:{}
      }
    }
  }
  test("bind textNode", () =>{
    BindToDom_parseBindText.mockClear();
    const parent = document.createElement("div");
    const node = document.createComment("@@:value");
    parent.appendChild(node);
    const binds = BindToText.bind(bindingManager, node);
    const replacedNode = parent.childNodes[0];
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, replacedNode, bindingManager.component.viewModel, "value", "textContent"]);
    expect(binds.length).toEqual(1);
    expect(replacedNode!==node).toBe(true);
    expect(binds[0].nodeProperty.node).toBe(parent.childNodes[0]);
    expect(binds[0].nodeProperty.name).toBe("textContent");
    expect(binds[0].viewModelProperty.name).toBe("value");
  });
  test("bind empty textNode", () =>{
    BindToDom_parseBindText.mockClear();
    const parent = document.createElement("div");
    const node = document.createComment("@@:");
    parent.appendChild(node);
    const binds = BindToText.bind(bindingManager, node);
    const replacedNode = parent.childNodes[0];
    expect(BindToDom_parseBindText.mock.calls.length).toBe(0);
    expect(binds.length).toEqual(0);
    expect(replacedNode===node).toBe(true);
  });
  test("bind no parent textNode", () =>{
    BindToDom_parseBindText.mockClear();
    const node = document.createComment("@@:value");
    expect(() => {
      const binds = BindToText.bind(bindingManager, node);
    }).toThrow("BindToText: no parent");
  });
  test("bind invalid textNode", () =>{
    BindToDom_parseBindText.mockClear();
    const parent = document.createElement("div");
    const node = document.createTextNode("@@:value");
    parent.appendChild(node);
    expect(() => {
      const binds = BindToText.bind(bindingManager, node);
    }).toThrow("BindToText: not Comment");
  });

});