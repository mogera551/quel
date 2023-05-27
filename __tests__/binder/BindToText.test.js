import { BindToText } from "../../src/binder/BindToText.js";
import { Symbols } from "../../src/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { TextBind } from "../../src/bindInfo/Text.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";

test("BindToText", () => {
  const parentNode = document.createElement("div");
  const node = document.createComment("@@:aaa");
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  };
  
  const binds = BindToText.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof TextBind).toBe(true);
  expect(binds[0].node instanceof Text).toBe(true);
  expect(binds[0].node.textContent).toBe("100");
  expect(() => binds[0].element).toThrow("not Element");
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
  const node = document.createTextNode("@@:aaa");
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
  expect(() => { const binds = BindToText.bind(node, component, { indexes:[], stack:[] }) }).toThrow("not Comment");
});