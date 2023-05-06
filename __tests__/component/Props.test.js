import { Component } from "../../src/component/Component.js";
import { createProps } from "../../src/component/Props.js";
import { Symbols } from "../../src/newViewModel/Symbols.js";
import { dotNotation } from "../../modules/imports.js";

class ViewModelHandler extends dotNotation.Handler {
}

class ViewModel {
  "aaa" = [10,20,30];
  "bbb" = true;
  "ccc" = 100;
  "ddd" = 200;
}

customElements.define("custom-tag", Component);
const parentComponent = document.createElement("custom-tag");
const component = document.createElement("custom-tag");
parentComponent.appendChild(component);

const dataViewModel = new ViewModel;
const viewModel = new Proxy(dataViewModel, new dotNotation.Handler());

parentComponent.viewModel = viewModel;

test("Props component", () => {
  const props = createProps(component);
  props[Symbols.bindProperty]("AAA0", "aaa.*", [0]);
  props[Symbols.bindProperty]("AAA1", "aaa.*", [1]);
  props[Symbols.bindProperty]("AAA2", "aaa.*", [2]);
  props[Symbols.bindProperty]("BBB", "bbb", []);
  expect(props["AAA0"]).toBe(10);
  expect(props["AAA1"]).toBe(20);
  expect(props["AAA2"]).toBe(30);
  expect(props["BBB"]).toBe(true);
  expect(props["CCC"]).toBe(undefined);
  expect(props["ccc"]).toBe(undefined);
  expect(() => { props["ccc"] = 100 }).toThrow();
  props["AAA0"] *= 4;
  expect(viewModel[Symbols.directlyGet]("aaa.*", [0])).toBe(40);
  expect(viewModel.aaa[0]).toBe(40);
  props["AAA1"] *= 4;
  expect(viewModel[Symbols.directlyGet]("aaa.*", [1])).toBe(80);
  expect(viewModel.aaa[1]).toBe(80);
  props["AAA2"] *= 4;
  expect(viewModel[Symbols.directlyGet]("aaa.*", [2])).toBe(120);
  expect(viewModel.aaa[2]).toBe(120);
  props["BBB"] = false;
  expect(viewModel["bbb"]).toBe(false);
});
