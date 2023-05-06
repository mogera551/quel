import { Checkbox } from "../../src/bindInfo/Checkbox.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";

test('Checkbox', () => {
//  let calledDirectlySet = undefined;
  const viewModel = {
    "aaa": [],
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
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = 100;

  const checkbox = new Checkbox;
  checkbox.component = component;
  checkbox.node = input;
  checkbox.nodeProperty = "checked";
  checkbox.viewModel = viewModel;
  checkbox.viewModelProperty = "aaa";
  checkbox.filters = [];

  input.checked = true;
  viewModel["aaa"] = [];
  checkbox.updateNode();
  expect(input.checked).toBe(false);
  viewModel["aaa"] = ["100"];
  checkbox.updateNode();
  expect(input.checked).toBe(true);
  checkbox.updateNode();
  expect(input.checked).toBe(true);

  input.checked = true;
  checkbox.updateViewModel();
  expect(viewModel["aaa"]).toEqual(["100"]);
  input.checked = false;
  checkbox.updateViewModel();
  expect(viewModel["aaa"]).toEqual([]);

  checkbox.node = document.createElement("div");
  expect(() => checkbox.updateNode()).toThrow();
  expect(() => checkbox.updateViewModel()).toThrow();
});
