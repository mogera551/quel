import { Component } from "../src/component/Component.js";
import { outputFilters } from "../src/filter/Builtin";
import { Filter } from "../src/filter/Filter.js";
import { GlobalData } from "../src/global/Data.js";
import { Main } from "../src/main.js";

test("Main.components", () => {
  class CustomComponent extends HTMLElement {
  }
  Main.components({
    CustomComponent
  });
  const costomComponent = document.createElement("custom-component");
  expect(costomComponent instanceof CustomComponent).toBe(true);
  expect(() => {
    Main.components({
      "c-c": CustomComponent
    });
  
  }).toThrow();

});

test("Main.componentModules", () => {
  const html = `{{aaa}}`;
  class ViewModel {
    "aaa" = 100;
  }
  const componentModules = {
    "cus-tag": {html, ViewModel},
  };
  Main.componentModules(componentModules);
  const costomComponent = document.createElement("cus-tag");
  expect(costomComponent instanceof Component).toBe(true);

});

test("Main.filters", () => {
  const registers = {
    "double": { output: (value, options) => value * 2, input:(value, options) => value / 2 },
  };
  Main.filters(registers);
  expect("double" in outputFilters).toBe(true);
  expect(Filter.applyForOutput(100, [ Object.assign(new Filter, { name:"double", options:[] }) ])).toBe(200);
  expect(Filter.applyForInput(250, [ Object.assign(new Filter, { name:"double", options:[] }) ])).toBe(125);

});

test("Main.globals", () => {
  Main.globals({ aaa:100 });
  expect(GlobalData.data.aaa).toBe(100);

});

test("Main.config", () => {
  Main.config({});
  expect(Main.debug).toBe(false);
  Main.config({ debug:true });
  expect(Main.debug).toBe(true);

});