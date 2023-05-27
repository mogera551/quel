import { AttributeBind } from "../../src/bindInfo/Attribute.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Symbols } from "../../src/Symbols.js";

test("AttributeBind", async () => {
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  };
  const div = document.createElement("div");

  const attributeBind = new AttributeBind;
  attributeBind.component = component;
  attributeBind.node = div;
  attributeBind.nodeProperty = "attr.title";
  attributeBind.nodePropertyElements = attributeBind.nodeProperty.split(".");
  attributeBind.viewModel = viewModel;
  attributeBind.viewModelProperty = "aaa";
  attributeBind.filters = [];

  div.setAttribute("title", "bbbbbb");
  viewModel["aaa"] = "cccccc";
  attributeBind.updateNode();
  expect(div.getAttribute("title")).toBe("cccccc");
  viewModel["aaa"] = "dddddd";
  attributeBind.updateNode();
  expect(div.getAttribute("title")).toBe("dddddd");
  attributeBind.updateNode();
  expect(div.getAttribute("title")).toBe("dddddd");
  viewModel["aaa"] = undefined;
  attributeBind.updateNode();
  expect(div.getAttribute("title")).toBe("");
  viewModel["aaa"] = null;
  attributeBind.updateNode();
  expect(div.getAttribute("title")).toBe("");

  div.setAttribute("title", "bbbbbb");
  attributeBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("bbbbbb");
  div.setAttribute("title", "cccccc");
  attributeBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("cccccc");
});