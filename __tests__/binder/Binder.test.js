import { Binder } from "../../src/binder/Binder.js";
import { Symbols } from "../../src/newViewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Template as TemplateBind } from "../../src/bindInfo/Template.js";
import { BindInfo } from "../../src/bindInfo/BindInfo.js";

test("Binder", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);

  const nodes = elements.concat(comments);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
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
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = Binder.bind(nodes, component, null, []);
  expect(binds[0] instanceof LevelTop).toBe(true);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].node).toBe(nodes[0]);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].contextBind).toBe(null);
  expect(binds[0].parentContextBind).toBe(null);
  expect(binds[0].positionContextIndexes).toBe(-1);

  expect(binds[1] instanceof LevelTop).toBe(true);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].node).toBe(nodes[1]);
  expect(binds[1].viewModelProperty).toBe("bbb");
  expect(binds[1].nodeProperty).toBe("textContent");
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].contextBind).toBe(null);
  expect(binds[1].parentContextBind).toBe(null);
  expect(binds[1].positionContextIndexes).toBe(-1);

  expect(binds[2] instanceof LevelTop).toBe(true);
  expect(binds[2].component).toBe(component);
  expect(binds[2].viewModel).toBe(viewModel);
  expect(binds[2].node).toBe(nodes[2]);
  expect(binds[2].viewModelProperty).toBe("ccc");
  expect(binds[2].nodeProperty).toBe("textContent");
  expect(binds[2].indexes).toEqual([]);
  expect(binds[2].contextIndexes).toEqual([]);
  expect(binds[2].contextBind).toBe(null);
  expect(binds[2].parentContextBind).toBe(null);
  expect(binds[2].positionContextIndexes).toBe(-1);

  expect(binds[3] instanceof TemplateBind).toBe(true);
  expect(binds[3].component).toBe(component);
  expect(binds[3].viewModel).toBe(viewModel);
  expect(binds[3].node instanceof Comment).toBe(true);
  expect(binds[3].viewModelProperty).toBe("ddd");
  expect(binds[3].nodeProperty).toBe("loop");
  expect(binds[3].indexes).toEqual([]);
  expect(binds[3].contextIndexes).toEqual([]);
  expect(binds[3].contextBind).toBe(null);
  expect(binds[3].parentContextBind).toBe(null);
  expect(binds[3].positionContextIndexes).toBe(-1);

  expect(binds[3].templateChildren.length).toBe(3);
  expect(binds[3].templateChildren[0].binds.length).toBe(1);
  expect(binds[3].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[0].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[0].binds[0].parentContextBind).toEqual(binds[3]);
  expect(binds[3].templateChildren[0].binds[0].positionContextIndexes).toBe(0);

  expect(binds[3].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[1].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[1].binds[0].parentContextBind).toEqual(binds[3]);
  expect(binds[3].templateChildren[1].binds[0].positionContextIndexes).toBe(0);

  expect(binds[3].templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[2].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[2].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[2].binds[0].indexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].contextIndexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[2].binds[0].parentContextBind).toEqual(binds[3]);
  expect(binds[3].templateChildren[2].binds[0].positionContextIndexes).toBe(0);

  expect(binds[4] instanceof LevelTop).toBe(true);
  expect(binds[4].component).toBe(component);
  expect(binds[4].viewModel).toBe(viewModel);
  expect(binds[4].node instanceof Text).toBe(true);
  expect(binds[4].viewModelProperty).toBe("eee");
  expect(binds[4].nodeProperty).toBe("textContent");
  expect(binds[4].indexes).toEqual([]);
  expect(binds[4].contextIndexes).toEqual([]);
  expect(binds[4].contextBind).toBe(null);
  expect(binds[4].parentContextBind).toBe(null);
  expect(binds[4].positionContextIndexes).toBe(-1);

});

test("Binder indexes", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);

  const nodes = elements.concat(comments);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
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
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const contextBind = new BindInfo();
  const binds = Binder.bind(nodes, component, contextBind, [100]);
  expect(binds[0] instanceof LevelTop).toBe(true);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].node).toBe(nodes[0]);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].contextIndexes).toEqual([100]);
  expect(binds[0].contextBind).toBe(contextBind);
  expect(binds[0].parentContextBind).toBe(null);
  expect(binds[0].positionContextIndexes).toBe(-1);

  expect(binds[1] instanceof LevelTop).toBe(true);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].node).toBe(nodes[1]);
  expect(binds[1].viewModelProperty).toBe("bbb");
  expect(binds[1].nodeProperty).toBe("textContent");
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].contextIndexes).toEqual([100]);
  expect(binds[1].contextBind).toBe(contextBind);
  expect(binds[1].parentContextBind).toBe(null);
  expect(binds[1].positionContextIndexes).toBe(-1);

  expect(binds[2] instanceof LevelTop).toBe(true);
  expect(binds[2].component).toBe(component);
  expect(binds[2].viewModel).toBe(viewModel);
  expect(binds[2].node).toBe(nodes[2]);
  expect(binds[2].viewModelProperty).toBe("ccc");
  expect(binds[2].nodeProperty).toBe("textContent");
  expect(binds[2].indexes).toEqual([]);
  expect(binds[2].contextIndexes).toEqual([100]);
  expect(binds[2].contextBind).toBe(contextBind);
  expect(binds[2].parentContextBind).toBe(null);
  expect(binds[2].positionContextIndexes).toBe(-1);

  expect(binds[3] instanceof TemplateBind).toBe(true);
  expect(binds[3].component).toBe(component);
  expect(binds[3].viewModel).toBe(viewModel);
  expect(binds[3].node instanceof Comment).toBe(true);
  expect(binds[3].viewModelProperty).toBe("ddd");
  expect(binds[3].nodeProperty).toBe("loop");
  expect(binds[3].indexes).toEqual([]);
  expect(binds[3].contextIndexes).toEqual([100]);
  expect(binds[3].templateChildren.length).toBe(3);
  expect(binds[3].contextBind).toBe(contextBind);
  expect(binds[3].parentContextBind).toBe(null);
  expect(binds[3].positionContextIndexes).toBe(-1);

  expect(binds[3].templateChildren[0].binds.length).toBe(1);
  expect(binds[3].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[0].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].contextIndexes).toEqual([100, 0]);
  expect(binds[3].templateChildren[0].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[0].binds[0].parentContextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[0].binds[0].positionContextIndexes).toBe(1);

  expect(binds[3].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[1].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].contextIndexes).toEqual([100, 1]);
  expect(binds[3].templateChildren[1].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[1].binds[0].parentContextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[1].binds[0].positionContextIndexes).toBe(1);

  expect(binds[3].templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[2].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[2].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[2].binds[0].indexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].contextIndexes).toEqual([100,2]);
  expect(binds[3].templateChildren[2].binds[0].contextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[2].binds[0].parentContextBind).toBe(binds[3]);
  expect(binds[3].templateChildren[2].binds[0].positionContextIndexes).toBe(1);

  expect(binds[4] instanceof LevelTop).toBe(true);
  expect(binds[4].component).toBe(component);
  expect(binds[4].viewModel).toBe(viewModel);
  expect(binds[4].node instanceof Text).toBe(true);
  expect(binds[4].viewModelProperty).toBe("eee");
  expect(binds[4].nodeProperty).toBe("textContent");
  expect(binds[4].indexes).toEqual([]);
  expect(binds[4].contextIndexes).toEqual([100]);
  expect(binds[4].contextBind).toBe(contextBind);
  expect(binds[4].parentContextBind).toBe(null);
  expect(binds[4].positionContextIndexes).toBe(-1);

});

test("Binder indexes fail", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);
  const failNode = document.createDocumentFragment();


  const nodes = elements.concat(comments).concat(failNode);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
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
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const contextBind = new BindInfo();
  expect(() => {
    const binds = Binder.bind(nodes, component, contextBind, [100]);
  }).toThrow();
});
