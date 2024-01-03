import { jest } from '@jest/globals';
import { Parser } from '../../src/binder/Parser';

describe("src/binder/Parser.js", () => {
  test("undefined", () => {
    expect(() => {
      Parser.parse(undefined, "textContent");
    }).toThrow("Parser: text is undefined");
  });
  test("empty", () => {
    const binds = Parser.parse("", "textContent");
    expect(binds.length).toBe(0);
  });
  test("single definition", () => {
    const binds = Parser.parse("textContent:value|substring,0,2", "textContent");
    expect(binds.length).toBe(1);
    expect(binds[0].nodeProperty).toBe("textContent");
    expect(binds[0].viewModelProperty).toBe("value");
    expect(binds[0].filters.length).toBe(1);
    expect(binds[0].filters[0]).toEqual({name:"substring", options:["0", "2"]});
  });
  test("multi definitions", () => {
    const binds = Parser.parse("textContent:value|substring,0,2; class.completed:value|lt,1000", "textContent");
    expect(binds.length).toBe(2);
    expect(binds[0].nodeProperty).toBe("textContent");
    expect(binds[0].viewModelProperty).toBe("value");
    expect(binds[0].filters.length).toBe(1);
    expect(binds[0].filters[0]).toEqual({name:"substring", options:["0", "2"]});
    expect(binds[1].nodeProperty).toBe("class.completed");
    expect(binds[1].viewModelProperty).toBe("value");
    expect(binds[1].filters.length).toBe(1);
    expect(binds[1].filters[0]).toEqual({name:"lt", options:["1000"]});
  });
  test("default", () => {
    const binds = Parser.parse("value", "textContent");
    expect(binds.length).toBe(1);
    expect(binds[0].nodeProperty).toBe("textContent");
    expect(binds[0].viewModelProperty).toBe("value");
    expect(binds[0].filters.length).toBe(0);
  });
  test("samename", () => {
    const binds = Parser.parse("value:@", "textContent");
    expect(binds.length).toBe(1);
    expect(binds[0].nodeProperty).toBe("value");
    expect(binds[0].viewModelProperty).toBe("value");
    expect(binds[0].filters.length).toBe(0);
  });
  test("default undefined", () => {
    expect(() => {
      const binds = Parser.parse("value", undefined);
    }).toThrow("parseBindText: default property undefined");
  });
  test("cache", () => {
    {
      const binds = Parser.parse("textContent:value", "textContent");
      expect(binds.length).toBe(1);
      expect(binds[0].nodeProperty).toBe("textContent");
      expect(binds[0].viewModelProperty).toBe("value");
      expect(binds[0].filters.length).toBe(0);
      expect(Parser.bindTextsByKey["textContent:value\ttextContent"]).toBe(binds);
    }
    {
      const cacheBinds = Parser.bindTextsByKey["textContent:value\ttextContent"];
      const binds = Parser.parse("textContent:value", "textContent");
      expect(binds).toBe(cacheBinds);
    }
  });

});