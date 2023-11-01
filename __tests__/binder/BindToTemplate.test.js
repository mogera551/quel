//import { Component } from "../../src/component/Component.js";
import { BindToTemplate } from "../../src/binder/BindToTemplate.js";
import { Symbols } from "../../src/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { LoopBind } from "../../src/bindInfo/template/Loop.js";
import { IfBind } from "../../src/bindInfo/template/If.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../../src/view/Templates.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Binding } from "../../src/binding/Binding.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";
import { Repeat } from "../../src/binding/nodeProperty/Repeat.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

test("BindToTemplate", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "loop:aaa";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
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
  const bindings = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].nodeProperty.constructor).toBe(Repeat);
  expect(bindings[0].nodeProperty.node instanceof Comment).toBe(true);
  expect(bindings[0].nodeProperty.name).toBe("loop");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["loop"]);
  expect(bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.indexes).toEqual([]);

});

test("BindToTemplate empty", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
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
  const bindings = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(bindings).toEqual([])
});

test("BindToTemplate throw", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("div");
  node.dataset.bind = "";
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
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
  expect(() => {
    const bindings = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  }).toThrow();
});

test("BindToTemplate throw", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "aaa";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
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
  expect(() => {
    const bindings = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  }).toThrow("default property undefined");
});

/**
 * ToDo: TemplateChildを持つ場合のテスト
 */