import { Handler, create } from "../../src/viewModel/ArrayProxy.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

test('ArrayProxy Handler', () => {
  let called = false;
  const updateCallback = () => {
    called = true;
  };
  const handler = new Handler(updateCallback);
  const target = [];
  const proxy = new Proxy(target, handler);
  expect(handler.updateCallback).toBe(updateCallback);

  called = false;
  proxy.push(100);
  expect(called).toBe(true);
  expect(target).toEqual([100]);

  called = false;
  proxy.push(200);
  expect(called).toBe(true);
  expect(target).toEqual([100, 200]);

  called = false;
  proxy.unshift(300);
  expect(called).toBe(true);
  expect(target).toEqual([300, 100, 200]);

  called = false;
  proxy.pop();
  expect(called).toBe(true);
  expect(target).toEqual([300, 100]);

  called = false;
  proxy.shift();
  expect(called).toBe(true);
  expect(target).toEqual([100]);

  called = false;
  proxy.splice(0, 1);
  expect(called).toBe(true);
  expect(target).toEqual([]);

  expect(proxy[Symbols.getRaw]).toBe(target);
  expect(proxy[Symbols.isProxy]).toBe(true);

  const proxy2 = create(target, updateCallback);
  called = false;
  proxy2.push(100);
  expect(called).toBe(true);
  expect(proxy2).toEqual([100]);

  called = false;
  proxy2.push(200);
  expect(called).toBe(true);
  expect(proxy2).toEqual([100, 200]);

  called = false;
  proxy2.unshift(300);
  expect(called).toBe(true);
  expect(proxy2).toEqual([300, 100, 200]);

  called = false;
  proxy2.pop();
  expect(called).toBe(true);
  expect(proxy2).toEqual([300, 100]);

  called = false;
  proxy2.shift();
  expect(called).toBe(true);
  expect(proxy2).toEqual([100]);

  called = false;
  proxy2.splice(0, 1);
  expect(called).toBe(true);
  expect(proxy2).toEqual([]);

  expect(proxy2[Symbols.getRaw]).toBe(target);
  expect(proxy2[Symbols.isProxy]).toBe(true);

});
