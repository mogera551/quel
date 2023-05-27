import { ClassNameBind } from "../../src/bindInfo/ClassName.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";

test('ClassNameBind', () => {
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  }

  const div = document.createElement("div");
  div.classList.add("class1");

  const className = new ClassNameBind;
  className.component = component;
  className.node = div;
  className.nodeProperty = "class";
  className.viewModel = viewModel;
  className.viewModelProperty = "aaa";
  className.filters = [];
  className.nodePropertyElements = ["class"];

  viewModel["aaa"] = ["class1"];
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1"]);
  viewModel["aaa"] = ["class1", "class2"];
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1", "class2"]);
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual(["class1", "class2"]);
  viewModel["aaa"] = [];
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual([]);
  className.updateNode();
  expect(Array.from(div.classList.values())).toEqual([]);

  className.updateViewModel();
  expect(viewModel["aaa"]).toEqual([]);
  div.classList.add("class2");
  className.updateViewModel();
  expect(viewModel["aaa"]).toEqual(["class2"]);
  div.classList.remove("class2");
  className.updateViewModel();
  expect(viewModel["aaa"]).toEqual([]);

  className.node = document.createTextNode("text");
  expect(() => className.updateNode()).toThrow();
  expect(() => className.updateViewModel()).toThrow();
});
