import { Component } from "../../src/component/Component.js";
import { BindToText } from "../../src/binder/BindToText.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";

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
  const binds = BindToText.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:100, lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ])
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
  expect(() => { const binds = BindToText.bind(node, component, null, []) }).toThrow();
});