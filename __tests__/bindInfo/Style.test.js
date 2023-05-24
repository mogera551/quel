import { AttributeBind } from "../../src/bindInfo/Attribute.js";
import { StyleBind } from "../../src/bindInfo/Style.js";
import { Symbols } from "../../src/Symbols.js";

test("StyleBind", async () => {
  const viewModel = {
    "color": "red",
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

  const styleBind = new StyleBind;
  styleBind.component = component;
  styleBind.node = div;
  styleBind.nodeProperty = "style.color";
  styleBind.nodePropertyElements = styleBind.nodeProperty.split(".");
  styleBind.viewModel = viewModel;
  styleBind.viewModelProperty = "color";
  styleBind.filters = [];

  div.style["color"] = "black";
  viewModel["color"] = "blue";
  styleBind.updateNode();
  expect(div.style["color"]).toBe("blue");
  viewModel["color"] = "red";
  styleBind.updateNode();
  expect(div.style["color"]).toBe("red");
  styleBind.updateNode();
  expect(div.style["color"]).toBe("red");

  div.style["color"] = "white";
  styleBind.updateViewModel();
  expect(viewModel["color"]).toEqual("white");
  div.style["color"] = "green";
  styleBind.updateViewModel();
  expect(viewModel["color"]).toEqual("green");
});

test("StyleBind throw", async () => {
  const viewModel = {
    "color": "red",
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
  const node = document.createTextNode("");

  const styleBind = new StyleBind;
  styleBind.component = component;
  styleBind.node = node;
  styleBind.nodeProperty = "style.color";
  styleBind.nodePropertyElements = styleBind.nodeProperty.split(".");
  styleBind.viewModel = viewModel;
  styleBind.viewModelProperty = "color";
  styleBind.filters = [];

  expect(() => styleBind.updateNode()).toThrow("not HTMLElement");

  expect(() => styleBind.updateViewModel()).toThrow("not HTMLElement");
});
