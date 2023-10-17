import { BindToText } from "../../src/binder/BindToText.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { NodeProperty } from "../../src/binding/nodePoperty/NodeProperty.js";
import { Binding } from "../../src/binding/Binding.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";

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
  expect(binds[0].constructor).toBe(Binding);
  expect(binds[0].nodeProperty.constructor).toBe(NodeProperty);
  expect(binds[0].nodeProperty.node.constructor).toBe(Text);
  expect(binds[0].nodeProperty.name).toBe("textContent");
  expect(binds[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[0].nodeProperty.applicable).toBe(true);
  expect(binds[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[0].nodeProperty.value).toBe("100");
  expect(binds[0].nodeProperty.filteredValue).toBe("100");
  expect(binds[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binds[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binds[0].viewModelProperty.applicable).toBe(true);
  expect(binds[0].viewModelProperty.name).toBe("aaa");
  expect(binds[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(binds[0].viewModelProperty.context).toEqual({indexes:[], stack:[]});
  expect(binds[0].viewModelProperty.contextParam).toBe(undefined);
  expect(binds[0].viewModelProperty.filters).toEqual([]);
  expect(binds[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[0].viewModelProperty.value).toBe(100);
  expect(binds[0].viewModelProperty.filteredValue).toBe(100);
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