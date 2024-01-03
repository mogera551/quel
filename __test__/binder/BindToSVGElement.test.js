import { jest } from '@jest/globals';
import { BindToSVGElement } from '../../src/binder/BindToSVGElement.js';
import { BindToDom } from '../../src/binder/BindToDom.js';
import { Radio } from '../../src/binding/nodeProperty/Radio.js';
import { Checkbox } from '../../src/binding/nodeProperty/Checkbox.js';
import { Binding } from '../../src/binding/Binding';
import { ElementProperty } from '../../src/binding/nodeProperty/ElementProperty';
import { ElementEvent } from '../../src/binding/nodeProperty/ElementEvent.js';
import { ViewModelProperty } from '../../src/binding/viewModelProperty/ViewModelProperty';

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
    } else {
      return new Binding(bindingManager, node, info.nodeProperty, ElementProperty, info.viewModelProperty, ViewModelProperty, info.filters);
    }
  });
});

describe("src/binder/BindToSVGElement.js", () => {
  const bindingManager = {
    component: {
      viewModel: {
        value:100,
        value2:200,
        values:[100,200,300],
        values2:[1000,2000,3000,4000],
        points: "0,0 20,10 10,20",
        click: () => {}
      },
      filters: {
        in:{}, out:{}
      }
    }
  }
  test("bind svg element", () =>{
    BindToDom_parseBindText.mockClear();
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("data-bind", "attr.points:points");
    const polygon_addEventListener = jest.spyOn(polygon, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToSVGElement.bind(bindingManager, polygon);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, polygon, bindingManager.component.viewModel, "attr.points:points", undefined]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(polygon);
    expect(binds[0].nodeProperty.name).toBe("attr.points");
    expect(binds[0].viewModelProperty.name).toBe("points");
    expect(polygon_addEventListener.mock.calls.length).toBe(0);
    polygon_addEventListener.mockReset();
  });
  test("bind invalid node", () =>{
    BindToDom_parseBindText.mockClear();
    const node = document.createTextNode("input");
    expect(() => {
      const binds = BindToSVGElement.bind(bindingManager, node);
    }).toThrow("BindToSVGElement: not SVGElement");
  });
  test("fail bind node without data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const polygon_addEventListener = jest.spyOn(polygon, "addEventListener").mockImplementation((event, listener) => {});
    expect(() => {
      const binds = BindToSVGElement.bind(bindingManager, polygon);
    }).toThrow("BindToSVGElement: data-bind is not defined");
    polygon_addEventListener.mockReset();
  });
  test("bind node empty data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("data-bind", "");
    const polygon_addEventListener = jest.spyOn(polygon, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToSVGElement.bind(bindingManager, polygon);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, polygon, bindingManager.component.viewModel, "", undefined]);
    expect(binds.length).toEqual(0);
    polygon_addEventListener.mockReset();
  });

});
