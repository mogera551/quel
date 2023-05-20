import { BindToText } from "../../src/binder/BindToText.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Symbols } from "../../src/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

test("BindToText", () => {
  const parentNode = document.createElement("div");
  const node = document.createComment("@@aaa");
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  const binds = BindToText.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof LevelTop).toBe(true);
  expect(binds[0].node instanceof Text).toBe(true);
  expect(binds[0].node.textContent).toBe("100");
  expect(() => binds[0].element).toThrow("not HTMLElement");
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe(100);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

});

test("BindToText throw", () => {
  const parentNode = document.createElement("div");
  const node = document.createTextNode("@@aaa");
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  expect(() => { const binds = BindToText.bind(node, component, { indexes:[], stack:[] }) }).toThrow();
});