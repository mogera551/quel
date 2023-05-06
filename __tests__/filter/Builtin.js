import { outputFilters, inputFilters } from "../../src/filter/Builtin.js";

test("Builtin outputFilters", () => {
  expect(outputFilters.localeString(1000, [])).toBe("1,000");
  expect(outputFilters.localeString(null, [])).toBe(null);

  expect(outputFilters.fixed(10, [])).toBe("10");
  expect(outputFilters.fixed(10, [2])).toBe("10.00");
  expect(outputFilters.fixed(null, [])).toBe(null);

  expect(outputFilters.styleDisplay(true, [])).toBe("");
  expect(outputFilters.styleDisplay(false, [])).toBe("none");
  expect(outputFilters.styleDisplay(true, ["block"])).toBe("block");

  expect(outputFilters.truthy(true, [])).toBe(true);
  expect(outputFilters.truthy(false, [])).toBe(false);

  expect(outputFilters.falsey(true, [])).toBe(false);
  expect(outputFilters.falsey(false, [])).toBe(true);

  expect(outputFilters.not(true, [])).toBe(false);
  expect(outputFilters.not(false, [])).toBe(true);

  expect(outputFilters.upperCase("aaaa", [])).toBe("AAAA");
  expect(outputFilters.upperCase("AAAA", [])).toBe("AAAA");
  expect(outputFilters.upperCase(null, [])).toBe(null);

  expect(outputFilters.lowerCase("aaaa", [])).toBe("aaaa");
  expect(outputFilters.lowerCase("AAAA", [])).toBe("aaaa");
  expect(outputFilters.lowerCase(null, [])).toBe(null);

  expect(outputFilters.eq("100", ["100"])).toBe(true);
  expect(outputFilters.eq(100, [100])).toBe(true);
  expect(outputFilters.eq("100", [100])).toBe(true);
  expect(outputFilters.eq(100, ["100"])).toBe(true);
  expect(outputFilters.eq(100, [101])).toBe(false);

  expect(outputFilters.ne("100", ["100"])).toBe(false);
  expect(outputFilters.ne(100, [100])).toBe(false);
  expect(outputFilters.ne("100", [100])).toBe(false);
  expect(outputFilters.ne(100, ["100"])).toBe(false);
  expect(outputFilters.ne(100, [101])).toBe(true);

  expect(outputFilters.lt("100", ["101"])).toBe(true);
  expect(outputFilters.lt(100, [101])).toBe(true);
  expect(outputFilters.lt("100", [101])).toBe(true);
  expect(outputFilters.lt(100, ["101"])).toBe(true);
  expect(outputFilters.lt(100, [100])).toBe(false);

  expect(outputFilters.le("100", ["100"])).toBe(true);
  expect(outputFilters.le(100, [100])).toBe(true);
  expect(outputFilters.le("100", [100])).toBe(true);
  expect(outputFilters.le(100, ["100"])).toBe(true);
  expect(outputFilters.le(100, [99])).toBe(false);

  expect(outputFilters.gt("101", ["100"])).toBe(true);
  expect(outputFilters.gt(101, [100])).toBe(true);
  expect(outputFilters.gt("101", [100])).toBe(true);
  expect(outputFilters.gt(101, ["100"])).toBe(true);
  expect(outputFilters.gt(100, [100])).toBe(false);

  expect(outputFilters.ge("100", ["100"])).toBe(true);
  expect(outputFilters.ge(100, [100])).toBe(true);
  expect(outputFilters.ge("100", [100])).toBe(true);
  expect(outputFilters.ge(100, ["100"])).toBe(true);
  expect(outputFilters.ge(99, [100])).toBe(false);

  expect(outputFilters.embed("aaa", ["message is %s"])).toBe("message is aaa");
  expect(outputFilters.embed("aaa", [])).toBe("");
  expect(outputFilters.embed(null, [])).toBe(null);

  expect(outputFilters.ifText(true, ["aaaa", "bbbb"])).toBe("aaaa");
  expect(outputFilters.ifText(false, ["aaaa", "bbbb"])).toBe("bbbb");
  expect(outputFilters.ifText(true, [])).toBe(null);
  expect(outputFilters.ifText(false, [])).toBe(null);

  expect(outputFilters.null(null, [])).toBe(true);
  expect(outputFilters.null(true, [])).toBe(false);
});

test("Builtin inputFilters", () => {
  expect(inputFilters.number("", [])).toBe(null);
  expect(inputFilters.number("10", [])).toBe(10);

  expect(inputFilters.boolean("", [])).toBe(null);
  expect(inputFilters.boolean("1", [])).toBe(true);
  expect(inputFilters.boolean(undefined, [])).toBe(false); //
});
