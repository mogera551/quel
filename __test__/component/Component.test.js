import { jest } from '@jest/globals';
import { ComponentClassGenerator, generateComponentClass, registComponentModule, registComponentModules } from "../../src/component/Component.js";

Promise.withResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
};
/*
describe("ComponentClassGenerator", () => {
  it("should generate a unique component class", () => {
    // Test code here
  });
});

describe("generateComponentClass", () => {
  it("should generate a unique component class", () => {
    // Test code here
  });
});

describe("registComponentModule", () => {
  it("should register a component module with a custom element name", () => {

  });
});
*/
describe("registComponentModules", () => {
  it("should register multiple component modules", () => {
    const componentModules = {
      "custom-element-name-1": { html:"", ViewModel:class {} },
      "custom-element-name-2": { html:"", ViewModel:class {} },
    };
    expect(customElements.get("custom-element-name-1")).toBeUndefined();
    expect(customElements.get("custom-element-name-2")).toBeUndefined();
    registComponentModules(componentModules);
    expect(customElements.get("custom-element-name-1")).toBeDefined();
    expect(customElements.get("custom-element-name-2")).toBeDefined();
    const element1 = document.createElement("custom-element-name-1");
    expect(element1 instanceof HTMLElement).toBe(true);
    const element2 = document.createElement("custom-element-name-2");
    expect(element2 instanceof HTMLElement).toBe(true);
  });
});
