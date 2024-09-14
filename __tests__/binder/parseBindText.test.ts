import "jest";
import { parseBindText } from "../../src/binder/parseBindText";
import { ParsedBindText } from "../../src/binder/types";

describe('parseBindText', () => {
  it('should return an empty array for empty input', () => {
    expect(parseBindText("", "default")).toEqual([]);
  });

  it('should parse single expression without filters', () => {
    const result: ParsedBindText[] = parseBindText("textContent:value", "default");
    expect(result).toEqual([
      {
        nodeProperty: "textContent",
        stateProperty: "value",
        inputFilters: [],
        outputFilters: []
      }
    ]);
  });

  it('should parse single expression with filters', () => {
    const result: ParsedBindText[] = parseBindText("textContent:value|eq,100|falsey", "default");
    expect(result).toEqual([
      {
        nodeProperty: "textContent",
        stateProperty: "value",
        inputFilters: [],
        outputFilters: [
          { name: "eq", options: ["100"] },
          { name: "falsey", options: [] }
        ]
      }
    ]);
  });

  it('should parse single expression with decode filters', () => {
    const result: ParsedBindText[] = parseBindText("textContent:value|eq,#100 100#|falsey", "default");
    expect(result).toEqual([
      {
        nodeProperty: "textContent",
        stateProperty: "value",
        inputFilters: [],
        outputFilters: [
          { name: "eq", options: ["100 100"] },
          { name: "falsey", options: [] }
        ]
      }
    ]);
  });

  it('should parse multiple expressions', () => {
    const result: ParsedBindText[] = parseBindText("textContent:value|eq,100|falsey;className:status|truthy", "default");
    expect(result).toEqual([
      {
        nodeProperty: "textContent",
        stateProperty: "value",
        inputFilters: [],
        outputFilters: [
          { name: "eq", options: ["100"] },
          { name: "falsey", options: [] }
        ]
      },
      {
        nodeProperty: "className",
        stateProperty: "status",
        inputFilters: [],
        outputFilters: [
          { name: "truthy", options: [] }
        ]
      }
    ]);
  });

  it('should handle default node property', () => {
    const result: ParsedBindText[] = parseBindText("value|eq,100|falsey", "default");
    expect(result).toEqual([
      {
        nodeProperty: "default",
        stateProperty: "value",
        inputFilters: [],
        outputFilters: [
          { name: "eq", options: ["100"] },
          { name: "falsey", options: [] }
        ]
      }
    ]);
  });

  it('should handle same name property', () => {
    const result: ParsedBindText[] = parseBindText("textContent:@|eq,100|falsey", "default");
    expect(result).toEqual([
      {
        nodeProperty: "textContent",
        stateProperty: "textContent",
        inputFilters: [],
        outputFilters: [
          { name: "eq", options: ["100"] },
          { name: "falsey", options: [] }
        ]
      }
    ]);
  });

  it('should cache parsed results', () => {
    const text = "textContent:value|eq,100|falsey";
    const defaultName = "default";
    const result1 = parseBindText(text, defaultName);
    const result2 = parseBindText(text, defaultName);
    expect(result1).toBe(result2); // Should be the same reference due to caching
  });
});