import { Level2nd } from "../../src/bindInfo/Level2nd.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

test("Level2nd", async () => {
  const viewModel = {
    "aaa": "block",
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
  const div = document.createElement("div");

  const level2nd = new Level2nd;
  level2nd.component = component;
  level2nd.node = div;
  level2nd.nodeProperty = "style.display";
  level2nd.nodePropertyElements = level2nd.nodeProperty.split(".");
  level2nd.viewModel = viewModel;
  level2nd.viewModelProperty = "aaa";
  level2nd.filters = [];

  div.style.display = "block";
  viewModel["aaa"] = "none";
  level2nd.updateNode();
  expect(div.style.display).toBe("none");
  viewModel["aaa"] = "block";
  level2nd.updateNode();
  expect(div.style.display).toBe("block");
  level2nd.updateNode();
  expect(div.style.display).toBe("block");
  viewModel["aaa"] = undefined;
  level2nd.updateNode();
  expect(div.style.display).toBe("");
  viewModel["aaa"] = null;
  level2nd.updateNode();
  expect(div.style.display).toBe("");

  div.style.display = "block";
  level2nd.updateViewModel();
  expect(viewModel["aaa"]).toEqual("block");
  div.style.display = "none";
  level2nd.updateViewModel();
  expect(viewModel["aaa"]).toEqual("none");
});