import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Symbols } from "../../src/Symbols.js";

test("LevelTop", async () => {
  const viewModel = {
    "aaa": false,
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
  const input = document.createElement("input");
  input.type = "text";

  const levelTop = new LevelTop;
  levelTop.component = component;
  levelTop.node = input;
  levelTop.nodeProperty = "value";
  levelTop.viewModel = viewModel;
  levelTop.viewModelProperty = "aaa";
  levelTop.filters = [];

  input.value = "100";
  viewModel["aaa"] = "200";
  levelTop.updateNode();
  expect(input.value).toBe("200");
  viewModel["aaa"] = 300;
  levelTop.updateNode();
  expect(input.value).toBe("300");
  levelTop.updateNode();
  expect(input.value).toBe("300");
  viewModel["aaa"] = undefined;
  levelTop.updateNode();
  expect(input.value).toBe("");
  viewModel["aaa"] = null;
  levelTop.updateNode();
  expect(input.value).toBe("");

  input.value = "500";
  levelTop.updateViewModel();
  expect(viewModel["aaa"]).toEqual("500");
  input.value = "600";
  levelTop.updateViewModel();
  expect(viewModel["aaa"]).toEqual("600");

});