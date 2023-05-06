import { Component } from "../../src/component/Component.js";
import { BindToTemplate } from "../../src/binder/BindToTemplate.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { Template } from "../../src/bindInfo/Template.js";

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
  const binds = BindToTemplate.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new Template, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.template,
      lastViewModelValue:[], lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
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
  const binds = BindToTemplate.bind(node, component, null, []);
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
    const binds = BindToTemplate.bind(node, component, null, []);
  }).toThrow();
});

/**
 * ToDo: TemplateChildを持つ場合のテスト
 */