import { Component } from "../../src/component/Component.js";
import { BindToTemplate } from "../../src/binder/BindToTemplate.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { Template } from "../../src/bindInfo/Template.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

test("BindToTemplate", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  node.dataset.bind = "loop:aaa";
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
  const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof Template).toBe(true);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(() => binds[0].element).toThrow("not HTMLElement");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
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
  expect(binds[0].lastViewModelValue).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

});

test("BindToTemplate empty", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
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
  const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(binds).toEqual([])
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
    const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  }).toThrow();
});

/**
 * ToDo: TemplateChildを持つ場合のテスト
 */