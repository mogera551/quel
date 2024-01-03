import { jest } from '@jest/globals';
import { BindToDom } from '../../src/binder/BindToDom.js';
import { Parser } from '../../src/binder/Parser.js';
import { Factory } from '../../src/binding/Factory.js';

const Parser_parse = jest.spyOn(Parser, "parse").mockImplementation((text, defaultName) => {
  return text.split(";").map(expr => {
    const [exprs1, exprs2] = expr.trim().split(":", 2);
    const [nodeProperty, viewModelPropertyAndFilters] = exprs2 ? [exprs1, exprs2] : [defaultName, exprs1];

    const [viewModelProperty, ...filters] = viewModelPropertyAndFilters.split("|");
    return {
      nodeProperty, viewModelProperty, filters
    }
  });
});

const Factory_create = jest.spyOn(Factory, "create").mockImplementation((bindingManager, node, nodeProperty, viewModel, viewModelProperty, filters) => {
  return {
    bindingManager,
    node,
    nodeProperty,
    viewModel,
    viewModelProperty,
    filters
  }
});

describe("src/binder/BindToDom.js", () => {
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
  test("element single definition", () => {
    Parser_parse.mockClear();
    Factory_create.mockClear();
    const [bindText, defaultName] = ["textContent:value", "textContent"];
    const div = document.createElement("div");
    div.setAttribute("data-bind", bindText);
    const binds = BindToDom.parseBindText(bindingManager, div, bindingManager.component.viewModel, bindText, defaultName);
    expect(Parser_parse.mock.calls.length).toBe(1);
    expect(Parser_parse.mock.calls[0]).toEqual(["textContent:value", "textContent"]);
    expect(Factory_create.mock.calls.length).toBe(1);
    expect(Factory_create.mock.calls[0]).toEqual([bindingManager, div, "textContent", bindingManager.component.viewModel, "value", []]);
  });
  test("element multi definition", () => {
    Parser_parse.mockClear();
    Factory_create.mockClear();
    const [bindText, defaultName] = ["textContent:value; name:value2", "textContent"];
    const div = document.createElement("div");
    div.setAttribute("data-bind", bindText);
    const binds = BindToDom.parseBindText(bindingManager, div, bindingManager.component.viewModel, bindText, defaultName);
    expect(Parser_parse.mock.calls.length).toBe(1);
    expect(Parser_parse.mock.calls[0]).toEqual(["textContent:value; name:value2", "textContent"]);
    expect(Factory_create.mock.calls.length).toBe(2);
    expect(Factory_create.mock.calls[0]).toEqual([bindingManager, div, "textContent", bindingManager.component.viewModel, "value", []]);
    expect(Factory_create.mock.calls[1]).toEqual([bindingManager, div, "name", bindingManager.component.viewModel, "value2", []]);
  });
  test("bindText is undefined", () => {
    Parser_parse.mockClear();
    Factory_create.mockClear();
    const [bindText, defaultName] = [undefined, "textContent"];
    const div = document.createElement("div");
    div.setAttribute("data-bind", bindText);
    expect(() => BindToDom.parseBindText(bindingManager, div, bindingManager.component.viewModel, bindText, defaultName)).toThrow("BindToDom: text is undefined");
  });
  test("bindText is empty", () => {
    Parser_parse.mockClear();
    Factory_create.mockClear();
    const [bindText, defaultName] = ["", "textContent"];
    const div = document.createElement("div");
    div.setAttribute("data-bind", bindText);
    const binds = BindToDom.parseBindText(bindingManager, div, bindingManager.component.viewModel, bindText, defaultName);
    expect(binds.length).toBe(0);
  });
});
