import { Component } from "../../src/component/Component.js";
import { createGlobals } from "../../src/component/Globals.js";
import { GlobalData } from "../../src/global/Data.js";
import { createViewModel } from "../../src/viewModel/Proxy.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

customElements.define("custom-tag", Component);
const component = document.createElement("custom-tag");
class ViewModel {

}
component.viewModel = createViewModel(component, ViewModel);
component.thread = {
  wakeup() {

  }
};

test("Globals get", () => {
  Object.assign(GlobalData.data, { aaa:100, bbb:[1,2,3] });
  const globals = createGlobals(component);
  expect(globals.aaa).toBe(100);
  expect(globals.bbb).toEqual([1,2,3]);
  expect(globals["bbb.0"]).toBe(1);
  expect(globals["bbb.1"]).toBe(2);
  expect(globals["bbb.2"]).toBe(3);
  expect(globals["bbb.3"]).toBe(undefined);
  expect(globals.zzz).toBe(undefined);
  expect(globals[Symbols.directlyGet]("bbb.*", [0])).toBe(1);
  expect(globals[Symbols.directlyGet]("bbb.*", [1])).toBe(2);
  expect(globals[Symbols.directlyGet]("bbb.*", [2])).toBe(3);
  expect(globals[Symbols.isSupportDotNotation]).toBe(true);
});

test("Globals set", () => {
  Object.assign(GlobalData.data, { aaa:100, bbb:[1,2,3], eee:0 });
  const globals = createGlobals(component);
  globals.aaa = 200;
  expect(globals.aaa).toBe(200);
  globals.bbb = [4,5];
  expect(globals.bbb).toEqual([4,5]);
  expect(globals["bbb.0"]).toBe(4);
  expect(globals["bbb.1"]).toBe(5);
  expect(globals["bbb.2"]).toBe(undefined);
  globals[Symbols.directlySet]("bbb.*", [0], 14);
  expect(globals[Symbols.directlyGet]("bbb.*", [0])).toBe(14);
  expect(GlobalData.data["bbb.0"]).toBe(14);
  globals[Symbols.directlySet]("bbb.*", [1], 15);
  expect(globals[Symbols.directlyGet]("bbb.*", [1])).toBe(15);
  expect(GlobalData.data["bbb.1"]).toBe(15);
  globals[Symbols.directlySet]("bbb.*", [2], 16);
  expect(globals[Symbols.directlyGet]("bbb.*", [2])).toBe(16);
  expect(GlobalData.data["bbb.2"]).toBe(16);
  expect(globals.bbb).toEqual([14,15,16]);
  expect(GlobalData.data.bbb).toEqual([14,15,16]);

  expect(globals[Symbols.directlyGet]("eee", [])).toBe(0);
  globals[Symbols.directlySet]("fff", [], 111111);
  expect(globals[Symbols.directlyGet]("fff", [])).toBe(111111);
});
