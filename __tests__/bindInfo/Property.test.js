import { PropertyBind } from "../../src/bindInfo/Property.js";
import { Symbols } from "../../src/Symbols.js";

test("PropertyBind", async () => {
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

  const propertyBind = new PropertyBind;
  propertyBind.component = component;
  propertyBind.node = input;
  propertyBind.nodeProperty = "value";
  propertyBind.nodePropertyElements = "value".split(".");
  propertyBind.viewModel = viewModel;
  propertyBind.viewModelProperty = "aaa";
  propertyBind.filters = [];

  input.value = "100";
  viewModel["aaa"] = "200";
  propertyBind.updateNode();
  expect(input.value).toBe("200");
  viewModel["aaa"] = 300;
  propertyBind.updateNode();
  expect(input.value).toBe("300");
  propertyBind.updateNode();
  expect(input.value).toBe("300");
  viewModel["aaa"] = undefined;
  propertyBind.updateNode();
  expect(input.value).toBe("");
  viewModel["aaa"] = null;
  propertyBind.updateNode();
  expect(input.value).toBe("");

  input.value = "500";
  propertyBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("500");
  input.value = "600";
  propertyBind.updateViewModel();
  expect(viewModel["aaa"]).toEqual("600");

});