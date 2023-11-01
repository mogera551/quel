import { BindToText } from "../../src/binder/BindToText.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { NodeProperty } from "../../src/binding/nodeProperty/NodeProperty.js";
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
  
  const bindings = BindToText.bind(node, component, { indexes:[], stack:[] });
  expect(bindings.length).toBe(1);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({indexes:[], stack:[]});
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].nodeProperty.constructor).toBe(NodeProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(Text);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe(100);
  expect(bindings[0].viewModelProperty.filteredValue).toBe(100);
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
  expect(() => { const bindings = BindToText.bind(node, component, { indexes:[], stack:[] }) }).toThrow("not Comment");
});