import {expect, jest, test} from '@jest/globals';

import { parse } from "../../src/newBinder/parseBindText.js";

describe("parse", () => {
  test("should parse textContent:value", () => {
    const actual = parse("textContent:value");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: []
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse textContent:value|eq,100", () => {
    const actual = parse("textContent:value|eq,100");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: [
        {name: "eq", options: ["100"]}
      ]
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse textContent:value|eq,100|falsey", () => {
    const actual = parse("textContent:value|eq,100|falsey");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: [
        {name: "eq", options: ["100"]},
        {name: "falsey", options: []}
      ]
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse textContent:value|eq,100|falsey|trim", () => {
    const actual = parse("textContent:value|eq,100|falsey|trim");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: [
        {name: "eq", options: ["100"]},
        {name: "falsey", options: []},
        {name: "trim", options: []}
      ]
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse textContent:value|eq,100|falsey|trim|replace,#,a", () => {
    const actual = parse("textContent:value|eq,100|falsey|trim|replace,#,a");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: [
        {name: "eq", options: ["100"]},
        {name: "falsey", options: []},
        {name: "trim", options: []},
        {name: "replace", options: ["#", "a"]}
      ]
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse empty", () => {
    const actual = parse("");
    const expected = [];
    expect(actual).toEqual(expected);
  });
  test("should parse empty", () => {
    const actual = parse(" ");
    const expected = [];
    expect(actual).toEqual(expected);
  });
  test("should parse cache textContent:value", () => {
    const actual = parse("textContent:value");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: []
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse error", () => {
    expect(() => parse()).toThrow();
  });
  test("should parse error", () => {
    expect(() => parse("value")).toThrow();
  });
  test("should parse defaultproperty", () => {
    const actual = parse("value", "textContent");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: []
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse decode", () => {
    const actual = parse("value|split,#%20#", "textContent");
    const expected = [{
      nodeProperty: "textContent",
      viewModelProperty: "value",
      filters: [
        {name: "split", options: [" "]},
      ]
    }];
    expect(actual).toEqual(expected);
  });
  test("should parse same name", () => {
    const actual = parse("value:@|split,#%20#");
    const expected = [{
      nodeProperty: "value",
      viewModelProperty: "value",
      filters: [
        {name: "split", options: [" "]},
      ]
    }];
    expect(actual).toEqual(expected);
  });

});