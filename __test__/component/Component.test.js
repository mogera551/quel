import { jest } from '@jest/globals';
import { ComponentClassGenerator, generateComponentClass, registComponentModule, registComponentModules } from "../../src/component/Component.js";
import { Symbols } from '../../src/Symbols.js';

Promise.withResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
};

describe("ComponentClassGenerator", () => {
  it("should generate a unique component class", () => {
    const componentModule = {};
    const componentClass = ComponentClassGenerator.generate(componentModule);
    expect(componentClass).toBeDefined();
    expect(componentClass.prototype instanceof HTMLElement).toBe(true);
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "viewModel")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "rootBinding")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "thread")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "updateSlot")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "props")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "globals")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "initialPromises")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "alivePromises")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "parentComponent")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useShadowRoot")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useWebComponent")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useLocalTagName")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useKeyed")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "viewRootElement")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "pseudoParentNode")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "pseudoNode")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "filters")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "bindingSummary")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "initialize")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "build")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "connectedCallback")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "disconnectedCallback")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "updateNode")).toBeDefined();
  });
});

describe("generateComponentClass", () => {
  it("should generate a unique component class", () => {
    // Test code here
    const componentModule = {};
    const componentClass = generateComponentClass(componentModule);
    expect(componentClass).toBeDefined();
    expect(componentClass.prototype instanceof HTMLElement).toBe(true);
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "viewModel")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "rootBinding")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "thread")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "updateSlot")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "props")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "globals")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "initialPromises")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "alivePromises")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "parentComponent")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useShadowRoot")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useWebComponent")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useLocalTagName")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "useKeyed")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "viewRootElement")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "pseudoParentNode")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "pseudoNode")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "filters")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "bindingSummary")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "initialize")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "build")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "connectedCallback")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "disconnectedCallback")).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(componentClass.prototype, "updateNode")).toBeDefined();
  });
});

describe("registComponentModule", () => {
  it("should register a component module with a custom element name, autonomous custom element", () => {
    expect(customElements.get("custom-element-name-3")).toBeUndefined();
    registComponentModule("custom-element-name-3", {});
    expect(customElements.get("custom-element-name-3")).toBeDefined();
    const element3 = document.createElement("custom-element-name-3");
    expect(element3 instanceof HTMLElement).toBe(true);
    expect(Symbols.isComponent in element3).toBe(true);
    expect(element3[Symbols.isComponent]).toBe(true);
  });

  it("should register a component module with a custom element name, customized built-in element", () => {
    expect(customElements.get("custom-element-name-4")).toBeUndefined();
    registComponentModule("custom-element-name-4", { extendTag: "div" });
    expect(customElements.get("custom-element-name-4")).toBeDefined();
    const element4 = document.createElement("div", { is: "custom-element-name-4" });
    expect(element4 instanceof HTMLElement).toBe(true);
    expect(element4 instanceof HTMLDivElement).toBe(true);
  });

  it("should register a component module with a custom element snake name, autonomous custom element", () => {
    expect(customElements.get("custom-element-name5")).toBeUndefined();
    registComponentModule("customElementName5", {});
    expect(customElements.get("custom-element-name5")).toBeDefined();
    const element5 = document.createElement("custom-element-name5");
    expect(element5 instanceof HTMLElement).toBe(true);
  });
});

describe("registComponentModules", () => {
  it("should register multiple component modules", () => {
    const componentModules = {
      "custom-element-name-1": { },
      "custom-element-name-2": { },
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
