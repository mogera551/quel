import { Radio } from "../../src/bindInfo/Radio.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";

test('Radio', () => {
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](prop, indexes) {
      return this[prop];
    },
    [Symbols.directlySet](prop, indexes, value) {
      this[prop] = value;
    }
  };
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
  };

  const input1 = document.createElement("input");
  input1.type = "radio";
  input1.value = 100;

  const radio1 = new Radio;
  radio1.component = component;
  radio1.node = input1;
  radio1.nodeProperty = "checked";
  radio1.viewModel = viewModel;
  radio1.viewModelProperty = "aaa";
  radio1.filters = [];

  const input2 = document.createElement("input");
  input2.type = "radio";
  input2.value = 200;

  const radio2 = new Radio;
  radio2.component = component;
  radio2.node = input2;
  radio2.nodeProperty = "checked";
  radio2.viewModel = viewModel;
  radio2.viewModelProperty = "aaa";
  radio2.filters = [];

  input1.checked = true;
  input2.checked = true;
  viewModel["aaa"] = "100";
  radio1.updateNode();
  radio2.updateNode();
  expect(input1.checked).toBe(true);
  expect(input2.checked).toBe(false);
  viewModel["aaa"] = "200";
  radio1.updateNode();
  radio2.updateNode();
  expect(input1.checked).toBe(false);
  expect(input2.checked).toBe(true);
  radio1.updateNode();
  radio2.updateNode();
  expect(input1.checked).toBe(false);
  expect(input2.checked).toBe(true);

  input1.checked = true;
  input2.checked = false;
  radio1.updateViewModel();
  radio2.updateViewModel();
  expect(viewModel["aaa"]).toBe("100");
  input1.checked = false;
  input2.checked = true;
  radio1.updateViewModel();
  radio2.updateViewModel();
  expect(viewModel["aaa"]).toBe("200");

  radio1.node = document.createElement("div");
  expect(() => radio1.updateNode()).toThrow();
  expect(() => radio1.updateViewModel()).toThrow();
});
