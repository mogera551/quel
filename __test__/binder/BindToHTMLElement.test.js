import { jest } from '@jest/globals';
import { BindToDom } from '../../src/binder/BindToDom.js';
import { BindToHTMLElement } from '../../src/binder/BindToHTMLElement.js';
import { Binding } from '../../src/binding/Binding.js';
import { Radio } from '../../src/binding/nodeProperty/Radio.js';
import { Checkbox } from '../../src/binding/nodeProperty/Checkbox.js';
import { ViewModelProperty } from '../../src/binding/viewModelProperty/ViewModelProperty.js';
import { ElementProperty } from '../../src/binding/nodeProperty/ElementProperty.js';
import { ElementEvent } from '../../src/binding/nodeProperty/ElementEvent.js';

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

describe("src/binder/BindToHTMLElement.js", () => {
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
  test("bind div", () =>{
    BindToDom_parseBindText.mockClear();
    const div = document.createElement("div");
    div.setAttribute("data-bind", "textContent:value");
    const div_addEventListener = jest.spyOn(div, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, div);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, div, bindingManager.component.viewModel, "textContent:value", "textContent"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(div);
    expect(binds[0].nodeProperty.name).toBe("textContent");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(div_addEventListener.mock.calls.length).toBe(0);
    div_addEventListener.mockReset();
  });
  test("fail bind div without data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const div = document.createElement("div");
    const div_addEventListener = jest.spyOn(div, "addEventListener").mockImplementation((event, listener) => {});
    expect(() => {
      const binds = BindToHTMLElement.bind(bindingManager, div);
    }).toThrow("BindToHTMLElement: data-bind is not defined");
    div_addEventListener.mockReset();
  });
  test("bind div empty data-bind", () =>{
    BindToDom_parseBindText.mockClear();
    const div = document.createElement("div");
    div.setAttribute("data-bind", "");
    const div_addEventListener = jest.spyOn(div, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, div);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, div, bindingManager.component.viewModel, "", "textContent"]);
    expect(binds.length).toEqual(0);
    expect(div_addEventListener.mock.calls.length).toBe(0);
    div_addEventListener.mockReset();
  });
  test("bind input text", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("data-bind", "value:value");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "value:value", "value"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(1);
    expect(input_addEventListener.mock.calls[0][0]).toBe("input");
    expect(input_addEventListener.mock.calls[0][1]).toBe(binds[0].defaultEventHandler);
    input_addEventListener.mockReset();
  });
  test("bind input text with oninput", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("data-bind", "value:value; oninput:click");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "value:value; oninput:click", "value"]);
    expect(binds.length).toEqual(2);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(binds[1].nodeProperty.node).toBe(input);
    expect(binds[1].nodeProperty.name).toBe("oninput");
    expect(binds[1].viewModelProperty.name).toBe("click");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind input radio", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("data-bind", "radio:value");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "radio:value", "checked"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("radio");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(1);
    expect(input_addEventListener.mock.calls[0][0]).toBe("input");
    expect(input_addEventListener.mock.calls[0][1]).toBe(binds[0].defaultEventHandler);
    input_addEventListener.mockReset();
  });
  test("bind input radio with oninput", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("data-bind", "radio:value; oninput:click");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "radio:value; oninput:click", "checked"]);
    expect(binds.length).toEqual(2);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("radio");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(binds[1].nodeProperty.node).toBe(input);
    expect(binds[1].nodeProperty.name).toBe("oninput");
    expect(binds[1].viewModelProperty.name).toBe("click");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind input checkbox", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("data-bind", "checkbox:value");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "checkbox:value", "checked"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("checkbox");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(1);
    expect(input_addEventListener.mock.calls[0][0]).toBe("input");
    expect(input_addEventListener.mock.calls[0][1]).toBe(binds[0].defaultEventHandler);
    input_addEventListener.mockReset();
  });
  test("bind input checkbox with oninput", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("data-bind", "checkbox:value; oninput:click");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "checkbox:value; oninput:click", "checked"]);
    expect(binds.length).toEqual(2);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("checkbox");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(binds[1].nodeProperty.node).toBe(input);
    expect(binds[1].nodeProperty.name).toBe("oninput");
    expect(binds[1].viewModelProperty.name).toBe("click");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind invalid node", () =>{
    BindToDom_parseBindText.mockClear();
    const node = document.createTextNode("input");
    expect(() => {
      const binds = BindToHTMLElement.bind(bindingManager, node);
    }).toThrow("BindToHTMLElement: not HTMLElement");
  });
  test("bind input button", () =>{
    BindToDom_parseBindText.mockClear();
    const input = document.createElement("input");
    input.setAttribute("type", "button");
    input.setAttribute("data-bind", "textContent:value");
    const input_addEventListener = jest.spyOn(input, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, input);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, input, bindingManager.component.viewModel, "textContent:value", "onclick"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(input);
    expect(binds[0].nodeProperty.name).toBe("textContent");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind button", () =>{
    BindToDom_parseBindText.mockClear();
    const button = document.createElement("button");
    button.setAttribute("data-bind", "textContent:value");
    const input_addEventListener = jest.spyOn(button, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, button);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, button, bindingManager.component.viewModel, "textContent:value", "onclick"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(button);
    expect(binds[0].nodeProperty.name).toBe("textContent");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind anchor", () =>{
    BindToDom_parseBindText.mockClear();
    const anchor = document.createElement("a");
    anchor.setAttribute("data-bind", "textContent:value");
    const input_addEventListener = jest.spyOn(anchor, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, anchor);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, anchor, bindingManager.component.viewModel, "textContent:value", "onclick"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(anchor);
    expect(binds[0].nodeProperty.name).toBe("textContent");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(input_addEventListener.mock.calls.length).toBe(0);
    input_addEventListener.mockReset();
  });
  test("bind select", () =>{
    BindToDom_parseBindText.mockClear();
    const select = document.createElement("select");
    select.setAttribute("data-bind", "value:value");
    const select_addEventListener = jest.spyOn(select, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, select);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, select, bindingManager.component.viewModel, "value:value", "value"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(select);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(select_addEventListener.mock.calls.length).toBe(1);
    expect(select_addEventListener.mock.calls[0][0]).toBe("input");
    expect(select_addEventListener.mock.calls[0][1]).toBe(binds[0].defaultEventHandler);
    select_addEventListener.mockReset();
  });
  test("bind select with oninput", () =>{
    BindToDom_parseBindText.mockClear();
    const select = document.createElement("select");
    select.setAttribute("data-bind", "value:value; oninput:click");
    const select_addEventListener = jest.spyOn(select, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, select);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, select, bindingManager.component.viewModel, "value:value; oninput:click", "value"]);
    expect(binds.length).toEqual(2);
    expect(binds[0].nodeProperty.node).toBe(select);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(binds[1].nodeProperty.node).toBe(select);
    expect(binds[1].nodeProperty.name).toBe("oninput");
    expect(binds[1].viewModelProperty.name).toBe("click");
    expect(select_addEventListener.mock.calls.length).toBe(0);
    select_addEventListener.mockReset();
  });

  test("bind textarea", () =>{
    BindToDom_parseBindText.mockClear();
    const textarea = document.createElement("textarea");
    textarea.setAttribute("data-bind", "value:value");
    const select_addEventListener = jest.spyOn(textarea, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, textarea);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, textarea, bindingManager.component.viewModel, "value:value", "value"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(textarea);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(select_addEventListener.mock.calls.length).toBe(1);
    expect(select_addEventListener.mock.calls[0][0]).toBe("input");
    expect(select_addEventListener.mock.calls[0][1]).toBe(binds[0].defaultEventHandler);
    select_addEventListener.mockReset();
  });
  test("bind textarea with oninput", () =>{
    BindToDom_parseBindText.mockClear();
    const textarea = document.createElement("textarea");
    textarea.setAttribute("data-bind", "value:value; oninput:click");
    const select_addEventListener = jest.spyOn(textarea, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, textarea);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, textarea, bindingManager.component.viewModel, "value:value; oninput:click", "value"]);
    expect(binds.length).toEqual(2);
    expect(binds[0].nodeProperty.node).toBe(textarea);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(binds[1].nodeProperty.node).toBe(textarea);
    expect(binds[1].nodeProperty.name).toBe("oninput");
    expect(binds[1].viewModelProperty.name).toBe("click");
    expect(select_addEventListener.mock.calls.length).toBe(0);
    select_addEventListener.mockReset();
  });
  test("bind option", () =>{
    BindToDom_parseBindText.mockClear();
    const option = document.createElement("option");
    option.setAttribute("data-bind", "value:value");
    const select_addEventListener = jest.spyOn(option, "addEventListener").mockImplementation((event, listener) => {});
    const binds = BindToHTMLElement.bind(bindingManager, option);
    expect(BindToDom_parseBindText.mock.calls.length).toBe(1);
    expect(BindToDom_parseBindText.mock.calls[0]).toEqual([bindingManager, option, bindingManager.component.viewModel, "value:value", "value"]);
    expect(binds.length).toEqual(1);
    expect(binds[0].nodeProperty.node).toBe(option);
    expect(binds[0].nodeProperty.name).toBe("value");
    expect(binds[0].viewModelProperty.name).toBe("value");
    expect(select_addEventListener.mock.calls.length).toBe(0);
    select_addEventListener.mockReset();
  });

});