import { dotNotation } from "../../modules/imports.js";
import { Cache } from "../../src/newViewModel/Cache.js";

test('Handler stackIndexes', () => {
  const cache = new Cache;
  expect(cache.get(undefined)).toBe(undefined);
  expect(cache.get(null)).toBe(undefined);

  cache.set(dotNotation.PropertyName.create("name"), [], 1);
  expect(cache.get(dotNotation.PropertyName.create("name"), [])).toBe(1);
  cache.set(dotNotation.PropertyName.create("name"), [0], 2);
  expect(cache.get(dotNotation.PropertyName.create("name"), [0])).toBe(2);
  cache.set(dotNotation.PropertyName.create("name"), [1], 3);
  expect(cache.get(dotNotation.PropertyName.create("name"), [1])).toBe(3);
  expect(cache.get(dotNotation.PropertyName.create("name"), [2])).toBe(undefined);

  cache.clear();
  expect(cache.get(dotNotation.PropertyName.create("name"), [])).toBe(undefined);
});
