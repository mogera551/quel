import { Level3rd } from "../../src/bindInfo/Level3rd.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

class CustomTag extends HTMLElement {
  aaa = {
    bbb: {
      ccc: 100
    }
  }

}
customElements.define("custom-tag", CustomTag);

test("Level3rd", async () => {
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
  const div = document.createElement("custom-tag");

  const level3rd = new Level3rd;
  level3rd.component = component;
  level3rd.node = div;
  level3rd.nodeProperty = "aaa.bbb.ccc";
  level3rd.nodePropertyElements = level3rd.nodeProperty.split(".");
  level3rd.viewModel = viewModel;
  level3rd.viewModelProperty = "aaa";
  level3rd.filters = [];

  div.aaa.bbb.ccc = undefined;
  viewModel["aaa"] = "100";
  level3rd.updateNode();
  expect(div.aaa.bbb.ccc).toBe("100");
  viewModel["aaa"] = "200";
  level3rd.updateNode();
  expect(div.aaa.bbb.ccc).toBe("200");
  level3rd.updateNode();
  expect(div.aaa.bbb.ccc).toBe("200");
  viewModel["aaa"] = undefined;
  level3rd.updateNode();
  expect(div.aaa.bbb.ccc).toBe("");
  viewModel["aaa"] = null;
  level3rd.updateNode();
  expect(div.aaa.bbb.ccc).toBe("");

  div.aaa.bbb.ccc = "500";
  level3rd.updateViewModel();
  expect(viewModel["aaa"]).toEqual("500");
  div.aaa.bbb.ccc = "600";
  level3rd.updateViewModel();
  expect(viewModel["aaa"]).toEqual("600");
});