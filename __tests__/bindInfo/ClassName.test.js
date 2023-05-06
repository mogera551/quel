import { ClassName } from "../../src/bindInfo/ClassName.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";

test('Checkbox', () => {
//  let calledDirectlySet = undefined;
  const viewModel = {
    "aaa": false,
    [Symbols.directlyGet](prop, indexes) {
      return this[prop];
    },
    [Symbols.directlySet](prop, indexes, value) {
      this[prop] = value;
    }
  };
//  let calledAddNodeUpdate = undefined;
  const component = {
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        Reflect.apply(nodeUpdateData.updateFunc, nodeUpdateData, []);
      }
    }
  }
  const div = document.createElement("div");
  div.classList.add("class1");

  const className = new ClassName;
  className.component = component;
  className.node = div;
  className.nodeProperty = "className.class2";
  className.viewModel = viewModel;
  className.viewModelProperty = "aaa";
  className.filters = [];
  className.nodePropertyElements = ["className", "class2"];

  viewModel["aaa"] = false;
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1"]);
  viewModel["aaa"] = true;
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1", "class2"]);
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1", "class2"]);
  viewModel["aaa"] = false;
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1"]);
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1"]);

  className.updateViewModel();
  expect(viewModel["aaa"]).toBe(false);
  div.classList.add("class2");
  className.updateViewModel();
  expect(viewModel["aaa"]).toBe(true);
  div.classList.remove("class2");
  className.updateViewModel();
  expect(viewModel["aaa"]).toBe(false);

  className.node = document.createTextNode("text");
  expect(() => className.updateNode()).toThrow();
  expect(() => className.updateViewModel()).toThrow();
});
