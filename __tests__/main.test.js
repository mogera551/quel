import { Symbols } from "../src/Symbols.js";
//import { Component } from "../src/component/Component.js";
import { inputFilters, outputFilters } from "../src/filter/Builtin";
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

test("Main.componentModules", async () => {
  const html = `{{aaa}}`;
  class ViewModel {
    "aaa" = 100;
  }
  const componentModules = {
    "cus-tag": {html, ViewModel},
  };
  Main.componentModules(componentModules);
  const root = document.createElement("div");
  root.innerHTML = `<cus-tag></cus-tag>`;
  document.body.appendChild(root);
  const customComponent = root.querySelector("cus-tag"); 
  await customComponent.initialPromise;
  expect(customComponent[Symbols.isComponent]).toBe(true);
  expect(customComponent instanceof HTMLElement).toBe(true);
  expect(customComponent.textContent).toBe("100");

});

test("Main.componentModules customized built-in", async () => {
  const html = `{{aaa}}`;
  class ViewModel {
    "aaa" = 100;
  }
  const componentModules = {
    "cus-tag2": {html, ViewModel, extendClass:HTMLDivElement, extendTag:"div"},
  };
  Main.componentModules(componentModules);
  const root = document.createElement("div");
  root.innerHTML = `<div is="cus-tag2"></div>`;
  document.body.appendChild(root);
  const customComponent = root.querySelector("div"); 
  await customComponent.initialPromise;
  expect(customComponent[Symbols.isComponent]).toBe(true);
  expect(customComponent instanceof HTMLDivElement).toBe(true);
  expect(customComponent.textContent).toBe("100");
});

test("Main.componentModules fail", () => {
  const html = `{{aaa}}`;
  class ViewModel {
    "aaa" = 100;
  }
  const componentModules1 = {
    "cus-tag3": {html, ViewModel, extendClass:HTMLDivElement},
  };
  expect(() => Main.componentModules(componentModules1)).toThrow("extendClass and extendTag should be both set, or unset");
  const componentModules2 = {
    "cus-tag4": {html, ViewModel, extendTag:"div"},
  };
  expect(() => Main.componentModules(componentModules2)).toThrow("extendClass and extendTag should be both set, or unset");
});

test("Main.filters", () => {
  const registers = {
    "double": { output: (value, options) => value * 2, input:(value, options) => value / 2 },
  };
  Main.filters(registers);
  expect("double" in outputFilters).toBe(true);
  expect("double" in inputFilters).toBe(true);
  expect(Filter.applyForOutput(100, [ Object.assign(new Filter, { name:"double", options:[] }) ], outputFilters)).toBe(200);
  expect(Filter.applyForInput(250, [ Object.assign(new Filter, { name:"double", options:[] }) ], inputFilters)).toBe(125);

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