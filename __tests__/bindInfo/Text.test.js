import { PropertyBind } from "../../src/bindInfo/Property.js";
import { TextBind } from "../../src/bindInfo/Text.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Symbols } from "../../src/Symbols.js";

test("TextBind", async () => {
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  };
  const text = document.createTextNode("");

  const textBind = new TextBind;
  textBind.component = component;
  textBind.node = text;
  textBind.nodeProperty = "value";
  textBind.nodePropertyElements = "value".split(".");
  textBind.viewModel = viewModel;
  textBind.viewModelProperty = "aaa";
  textBind.filters = [];

  text.textContent = "100";
  viewModel["aaa"] = "200";
  textBind.updateNode();
  expect(text.textContent).toBe("200");
  viewModel["aaa"] = 300;
  textBind.updateNode();
  expect(text.textContent).toBe("300");
  textBind.updateNode();
  expect(text.textContent).toBe("300");
  viewModel["aaa"] = undefined;
  textBind.updateNode();
  expect(text.textContent).toBe("");
  viewModel["aaa"] = null;
  textBind.updateNode();
  expect(text.textContent).toBe("");

  text.textContent = "500";
  textBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("500");
  text.textContent = "600";
  textBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("600");

});