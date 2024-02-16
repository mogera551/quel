import { Module } from "../../src/component/Module.js";
import { config } from "../../src/Config.js";

describe("Module", () => {
  let module;

  beforeEach(() => {
    module = new Module();
    module.html = "<div></div>";
    module.ViewModel = class {};
  });

  test("should have default property's value", () => {
    module = new Module();
    expect(module.uuid).toBeDefined();
    expect(module.html).toBe("");
    expect(module.css).toBeUndefined();
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe("");
    expect(module.ViewModel).toBeDefined();
    expect(module.extendTag).toBeUndefined();
    expect(module.useWebComponent).toBeUndefined();
    expect(module.useShadowRoot).toBeUndefined();
    expect(module.useLocalTagName).toBeUndefined();
    expect(module.useKeyed).toBeUndefined();
    expect(module.inputFilters).toBeUndefined();
    expect(module.outputFilters).toBeUndefined();
    expect(module.componentModules).toBeUndefined();
    expect(module.componentModulesForRegist).toBeUndefined();
  });

  test("should have a unique UUID", () => {
    expect(module.uuid).toBeDefined();
    expect(typeof module.uuid).toBe("string");

    const module2 = new Module();
    expect(module2.uuid).toBeDefined();
    expect(typeof module2.uuid).toBe("string");
    expect(module2.uuid).not.toBe(module.uuid);
  });

  test("should have an HTML property", () => {
    expect(module.html).toBeDefined();
    expect(typeof module.html).toBe("string");
  });

  test("should have an optional CSS property", () => {
    expect(module.css).toBeUndefined();
  });

  test("should have a template property without css", () => {
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(module.html);
  });

  test("should have a template property with css", () => {
    module.css = "div { color: red; }";
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(`<style>\n${module.css}\n</style>${module.html}`);
  });

  test("should have a template property, useLocalTagName is true", () => {
    module.useLocalTagName = true;
    module.componentModules = {
      "sub-component": new Module()
    };
    module.html = "<sub-component></sub-component>";
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(`<sub-component-${module.uuid} data-orig-tag-name="sub-component"></sub-component-${module.uuid}>`);
  });

  test("should have a template property, useLocalTagName is false", () => {
    module.useLocalTagName = false;
    module.componentModules = {
      "sub-component": new Module()
    };
    module.html = "<sub-component></sub-component>";
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(`<sub-component></sub-component>`);
  });

  test("should have a template property, useLocalTagName is undefined, config.useLocaTagName is true", () => {
    module.componentModules = {
      "sub-component": new Module()
    };
    module.html = "<sub-component></sub-component>";
    config.useLocalTagName = true;
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(`<sub-component-${module.uuid} data-orig-tag-name="sub-component"></sub-component-${module.uuid}>`);
  });

  test("should have a template property, useLocalTagName is undefined, config.useLoalTagName is false", () => {
    module.componentModules = {
      "sub-component": new Module()
    };
    module.html = "<sub-component></sub-component>";
    config.useLocalTagName = false;
    expect(module.template).toBeDefined();
    expect(module.template instanceof HTMLTemplateElement).toBe(true);
    expect(module.template.content instanceof DocumentFragment).toBe(true);
    expect(module.template.innerHTML).toBe(`<sub-component></sub-component>`);
  });

  test("should have a ViewModel property", () => {
    expect(module.ViewModel).toBeDefined();
    expect(typeof module.ViewModel).toBe("function");
  });

  test("should have an optional extendTag property", () => {
    expect(module.extendTag).toBeUndefined();
    module.extendTag = "div";
    expect(module.extendTag).toBeDefined();
  });

  test("should have an optional useWebComponent property", () => {
    expect(module.useWebComponent).toBeUndefined();
    module.useWebComponent = true;
    expect(module.useWebComponent).toBeDefined();
  });

  test("should have an optional useShadowRoot property", () => {
    expect(module.useShadowRoot).toBeUndefined();
    module.useShadowRoot = true;
    expect(module.useShadowRoot).toBeDefined();
  });

  test("should have an optional useLocalTagName property", () => {
    expect(module.useLocalTagName).toBeUndefined();
    module.useLocalTagName = true;
    expect(module.useLocalTagName).toBeDefined();
  });

  test("should have an optional useKeyed property", () => {
    expect(module.useKeyed).toBeUndefined();
    module.useKeyed = true;
    expect(module.useKeyed).toBeDefined();
  });

  test("should have an optional inputFilters property", () => {
    expect(module.inputFilters).toBeUndefined();
    module.inputFilters = {};
    expect(module.inputFilters).toBeDefined();
  });

  test("should have an optional outputFilters property", () => {
    expect(module.outputFilters).toBeUndefined();
    module.outputFilters = {};
    expect(module.outputFilters).toBeDefined();
  });

  test("should have an optional componentModules property", () => {
    expect(module.componentModules).toBeUndefined();
    module.componentModules = {
      "sub-component": new Module()
    }
    expect(module.componentModules).toBeDefined();
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is false, componentModules is undefined", () => {
    module.useLocalTagName = false;
    expect(module.componentModulesForRegist).toBe(module.componentModules);
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is false, componentModules is defined", () => {
    module.useLocalTagName = false;
    module.componentModules = {
      "sub-component": new Module()
    };
    expect(module.componentModulesForRegist).toBe(module.componentModules);
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is true, componentModules is undefined", () => {
    module.useLocalTagName = true;
    expect(module.componentModulesForRegist).toBeUndefined();
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is true,  componentModules is defined", () => {
    module.useLocalTagName = true;
    module.componentModules = {
      "sub-component": new Module()
    };
    expect(module.componentModulesForRegist).toBeDefined();
    expect(typeof module.componentModulesForRegist).toBe("object");
    expect(Object.keys(module.componentModulesForRegist).length).toBe(1);
    expect(module.componentModulesForRegist[`sub-component-${module.uuid}`]).toBeInstanceOf(Module);
    expect(module.componentModulesForRegist[`sub-component`]).toBeUndefined();
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is undefined, config.useLocalTagName is false, componentModules is undefined", () => {
    config.useLocalTagName = false;
    expect(module.componentModulesForRegist).toBe(module.componentModules);
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is undefined, config.useLocalTagName is false, componentModules is defined", () => {
    config.useLocalTagName = false;
    module.componentModules = {
      "sub-component": new Module()
    };
    expect(module.componentModulesForRegist).toBe(module.componentModules);
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is undefined, config.useLocalTagName is true, componentModules is undefined", () => {
    config.useLocalTagName = true;
    expect(module.componentModulesForRegist).toBeUndefined();
  });

  test("should have a getter for componentModulesForRegist property, useLocalTagName is undefined, config.useLocalTagName is true, componentModules is defined ", () => {
    config.useLocalTagName = true;
    module.componentModules = {
      "sub-component": new Module()
    };
    expect(module.componentModulesForRegist).toBeDefined();
    expect(typeof module.componentModulesForRegist).toBe("object");
    expect(Object.keys(module.componentModulesForRegist).length).toBe(1);
    expect(module.componentModulesForRegist[`sub-component-${module.uuid}`]).toBeInstanceOf(Module);
    expect(module.componentModulesForRegist[`sub-component`]).toBeUndefined();
  });
});
