import { jest } from '@jest/globals';
import { BindToTemplate } from '../../src/binder/BindToTemplate.js';
import { BindToDom } from '../../src/binder/BindToDom.js';
import { Radio } from '../../src/binding/nodeProperty/Radio.js';
import { Checkbox } from '../../src/binding/nodeProperty/Checkbox.js';
import { Binding } from '../../src/binding/Binding';
import { ElementProperty } from '../../src/binding/nodeProperty/ElementProperty';
import { ElementEvent } from '../../src/binding/nodeProperty/ElementEvent.js';
import { ViewModelProperty } from '../../src/binding/viewModelProperty/ViewModelProperty';
import { Branch } from '../../src/binding/nodeProperty/Branch.js';
import { Repeat } from '../../src/binding/nodeProperty/Repeat.js';
import { Templates } from '../../src/view/Templates.js';

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
    } else {
      return new Binding(bindingManager, node, info.nodeProperty, ElementProperty, info.viewModelProperty, ViewModelProperty, info.filters);
    }
  });
});

describe("src/binder/BindToTemplate.js", () => {
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
  const template = document.createElement("template");
  template.innerHTML = "<div></div>";
  template.setAttribute("data-bind", "if:checked");
  Templates.templateByUUID.set("1", template)
  const template2 = document.createElement("template");
  template2.innerHTML = "<div></div>";
  template2.setAttribute("data-bind", "loop:values");
  Templates.templateByUUID.set("2", template2)
  const template3 = document.createElement("template");
  template3.innerHTML = "<div></div>";
  Templates.templateByUUID.set("3", template3)
  const template4 = document.createElement("template");
  template4.innerHTML = "<div></div>";
  template4.setAttribute("data-bind", "");
  Templates.templateByUUID.set("4", template4)
  test("bind branch", () =>{
    BindToDom_parseBindText.mockClear();
    const branch = document.createComment('@@|1');
    const binds = BindToTemplate.bind(bindingManager, branch);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, branch, bindingManager.component.viewModel, "if:checked", undefined]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(branch);
    expect(binds[0].nodeProperty.name).toBe("if");
    expect(binds[0].viewModelProperty.name).toBe("checked");
  });
  test("bind repeat", () =>{
    BindToDom_parseBindText.mockClear();
    const repeat = document.createComment('@@|2');
    const binds = BindToTemplate.bind(bindingManager, repeat);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, repeat, bindingManager.component.viewModel, "loop:values", undefined]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(repeat);
    expect(binds[0].nodeProperty.name).toBe("loop");
    expect(binds[0].viewModelProperty.name).toBe("values");
  });
  test("bind invalid node", () =>{
    BindToDom_parseBindText.mockClear();
    const node = document.createTextNode("input");
    expect(() => {
      const binds = BindToTemplate.bind(bindingManager, node);
    }).toThrow("BindToTemplate: not Comment");
  });
  test("bind template not found", () =>{
    BindToDom_parseBindText.mockClear();
    const notFound = document.createComment('@@|5');
    expect(() => {
      const binds = BindToTemplate.bind(bindingManager, notFound);
    }).toThrow("BindToTemplate: template not found");
  });
  test("fail bind template without data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const withoutDataBind = document.createComment('@@|3');
    expect(() => {
      const binds = BindToTemplate.bind(bindingManager, withoutDataBind);
    }).toThrow("BindToTemplate: data-bind is not defined");
  });
  test("fail bind template empty data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const emptyDataBind = document.createComment('@@|4');
    const binds = BindToTemplate.bind(bindingManager, emptyDataBind);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, emptyDataBind, bindingManager.component.viewModel, "", undefined]);
    expect(binds.length).toEqual(0);
  });

});
