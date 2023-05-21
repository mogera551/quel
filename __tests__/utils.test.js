import { utils } from "../src/utils.js";

test("utils.raise", () => {
  expect(() => utils.raise("aaa")).toThrow("aaa");
});

test("utils.isFunction", () => {
  class Target {
    method1() {

    }
    static method2() {

    }
    member1;
    static member2;
  }
  const target = new Target;
  const fn1 = () => {};
  const fn2 = function() {
  }
  function fn3() {
  }
  async function fn4() {
  }
  expect(utils.isFunction(target.method1)).toBe(true);
  expect(utils.isFunction(Target.method2)).toBe(true);
  expect(utils.isFunction(target.member1)).toBe(false);
  expect(utils.isFunction(Target.member2)).toBe(false);
  expect(utils.isFunction(fn1)).toBe(true);
  expect(utils.isFunction(fn2)).toBe(true);
  expect(utils.isFunction(fn3)).toBe(true);
  expect(utils.isFunction(fn4)).toBe(true);
});

test("utils.isInputableElement", () => {
  const input1 = document.createElement("input");
  expect(utils.isInputableElement(input1)).toBe(true);
  const input2 = document.createElement("input");
  input2.type = "button";
  expect(utils.isInputableElement(input2)).toBe(false);
  const textarea = document.createElement("textarea");
  expect(utils.isInputableElement(textarea)).toBe(true);
  const select = document.createElement("select");
  expect(utils.isInputableElement(select)).toBe(true);
  const div = document.createElement("div");
  expect(utils.isInputableElement(div)).toBe(false);
});

test("utils.toKebabCase", () => {
  expect(utils.toKebabCase("aaa")).toBe("aaa");
  expect(utils.toKebabCase("Aaa")).toBe("aaa");
  expect(utils.toKebabCase("aaa-bbb")).toBe("aaa-bbb");
  expect(utils.toKebabCase("aaa_bbb")).toBe("aaa-bbb");
  expect(utils.toKebabCase("AaaBbb")).toBe("aaa-bbb");
  expect(utils.toKebabCase(123)).toBe(123);
});

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
test("utils.createUUID", () => {
  Object.defineProperty(window, 'crypto', {
    value: { randomUUID: fn_randomeUUID },
  });
  expect(utils.createUUID()).toBe("xxxx-xxxx-xxxx-xxxx-0");
  expect(utils.createUUID()).toBe("xxxx-xxxx-xxxx-xxxx-1");
  expect(utils.createUUID()).toBe("xxxx-xxxx-xxxx-xxxx-2");
  delete window.crypto;
  expect(utils.createUUID().match(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}/) !== null).toBe(true);
})
