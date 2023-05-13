import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Cache } from "../../src/viewModel/Cache.js";

test('Handler stackIndexes', () => {
  const cache = new Cache;
  expect(cache.get(undefined)).toBe(undefined);
  expect(cache.get(null)).toBe(undefined);

  cache.set(PropertyName.create("name"), [], 1);
  expect(cache.get(PropertyName.create("name"), [])).toBe(1);
  cache.set(PropertyName.create("name"), [0], 2);
  expect(cache.get(PropertyName.create("name"), [0])).toBe(2);
  cache.set(PropertyName.create("name"), [1], 3);
  expect(cache.get(PropertyName.create("name"), [1])).toBe(3);
  expect(cache.get(PropertyName.create("name"), [2])).toBe(undefined);

  cache.clear();
  expect(cache.get(PropertyName.create("name"), [])).toBe(undefined);
});
