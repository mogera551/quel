import { Template, TemplateChild } from "../../src/bindInfo/Template.js"; 
import { Symbols } from "../../src/newViewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";

const viewModel = {
  "aaa": [10,20,30],
  "bbb": true,
  "ccc": [
    [11,21],
    [12,22],
  ],
  "ddd": [40,50,60],
  _indexes:undefined,
  get "aaa.*"() {
    return this["aaa"][this._indexes[0]];
  },
  get "ccc.*"() {
    return this["ccc"][this._indexes[0]];
  },
  get "ccc.*.*"() {
    return this["ccc.*"][this._indexes[1]];
  },
  get "ddd.*"() {
    return this["ddd"][this._indexes[0]];
  },
  [Symbols.directlyGet](prop, indexes) {
    this._indexes = indexes;
    return this[prop];
  },
  [Symbols.directlySet](prop, indexes, value) {
    this._indexes = indexes;
    this[prop] = value;
  }
};
const component = {
  viewModel,
  updateSlot: {
    /**
     * 
     * @param {NodeUpdateData} nodeUpdateData 
     */
    addNodeUpdate(nodeUpdateData) {
      Reflect.apply(nodeUpdateData.updateFunc, nodeUpdateData, []);
    }
  }
};

test("Template if", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "if:bbb";
  templateNode.innerHTML = "<div class='bbb_is_true'>bbb is true</div>";

  const template = new Template;
  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "if";
  template.viewModel = viewModel;
  template.viewModelProperty = "bbb";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];
  expect(template.node instanceof Comment).toBe(true);

  template.updateNode();
  expect(template.templateChildren.length).toBe(1);
  expect(template.templateChildren[0].binds.length).toBe(0);
  expect(parentNode.querySelector(".bbb_is_true") != null).toBe(true);

  viewModel.bbb = false;
  template.updateNode();
  expect(template.templateChildren.length).toBe(0);
  expect(parentNode.querySelector(".bbb_is_true") == null).toBe(true);

  // cache
  template.updateNode();
  expect(template.templateChildren.length).toBe(0);
  expect(parentNode.querySelector(".bbb_is_true") == null).toBe(true);
});

test("Template loop no binds", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'>aaa.* is true</div>";

  const template = new Template;
  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];
  expect(template.node instanceof Comment).toBe(true);

  template.updateNode();
  expect(template.templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds.length).toBe(0);
  expect(template.templateChildren[1].binds.length).toBe(0);
  expect(template.templateChildren[2].binds.length).toBe(0);
  expect(Array.from(parentNode.querySelectorAll(".aaa__is_exists")).length).toBe(3);

  viewModel.aaa = [10,10];
  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(0);
  expect(template.templateChildren[1].binds.length).toBe(0);
  expect(Array.from(parentNode.querySelectorAll(".aaa__is_exists")).length).toBe(2);
});

test("Template loop binds", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@aaa.*--></div>";

  viewModel.aaa = [10,20,30];

  const template = new Template;
  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];
  expect(template.node instanceof Comment).toBe(true);

  template.updateNode();
  expect(template.templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(template.templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[2].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[2].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[2].binds[0].indexes).toEqual([2]);
  expect(template.templateChildren[2].binds[0].contextIndexes).toEqual([2]);
  expect(Array.from(parentNode.querySelectorAll(".aaa__is_exists")).length).toBe(3);

  viewModel.aaa = [20,10];
  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(Array.from(parentNode.querySelectorAll(".aaa__is_exists")).length).toBe(2);
});

test("Template loop loop binds", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:ccc";
  templateNode.innerHTML = `
<template data-bind="loop:ccc.*">
  <div class='ccc___is_exists'><!--@@ccc.*.*--></div>
</template>
`;

  viewModel.ccc = [[11,22],[111,222]];

  const template = new Template;
  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "ccc";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];
  expect(template.node instanceof Comment).toBe(true);

  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].indexes).toEqual([1, 1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1, 1]);

  expect(Array.from(parentNode.querySelectorAll(".ccc___is_exists")).length).toBe(4);

  viewModel.ccc = [[111,222,333]];

  template.updateNode();
  expect(template.templateChildren.length).toBe(1);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].indexes).toEqual([0, 2]);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0].contextIndexes).toEqual([0, 2]);

  expect(Array.from(parentNode.querySelectorAll(".ccc___is_exists")).length).toBe(3);
});

test("Template loop in loop binds", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = `
<template data-bind="loop:ddd">
  <div class='aaa___is_exists'><!--@@aaa.*--></div>
</template>
`;

  viewModel.aaa = [10,20];
  viewModel.ddd = [30,40];

  const template = new Template;
  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];
  expect(template.node instanceof Comment).toBe(true);

  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1, 1]);

  expect(Array.from(parentNode.querySelectorAll(".aaa___is_exists")).length).toBe(4);

  viewModel.aaa = [20,10,0];

  template.updateNode();

  expect(template.templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1, 1]);

  expect(template.templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0] instanceof Template).toBe(true);
  expect(template.templateChildren[2].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[2].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[2].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[2].binds[0].contextIndexes).toEqual([2]);

  expect(template.templateChildren[2].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].indexes).toEqual([2]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([2, 0]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].indexes).toEqual([2]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([2, 1]);

  expect(Array.from(parentNode.querySelectorAll(".aaa___is_exists")).length).toBe(6);
});

test("Template loop throw", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("div");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@aaa.*--></div>";

  viewModel.aaa = [10,20,30];

  const template = new Template;

  expect(() => {
    template.component = component;
    template.node = templateNode;
    template.nodeProperty = "loop";
    template.viewModel = viewModel;
    template.viewModelProperty = "aaa";
    template.filters = [];
    template.indexes = [];
    template.contextIndexes = [];
  }).toThrow();
});

test("Template loop throw2", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@aaa.*--></div>";

  viewModel.aaa = [10,20,30];

  const template = new Template;

  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "notloop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];

  expect(() => {
    template.updateNode();
  }).toThrow();
});

test("Template loop array undefined", () => {
  const parentNode = document.createElement("div");
  const templateNode = document.createElement("template");
  parentNode.appendChild(templateNode);
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@aaa.*--></div>";

  viewModel.aaa = undefined;

  const template = new Template;

  template.component = component;
  template.node = templateNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.indexes = [];
  template.contextIndexes = [];

  template.updateNode();
  expect(template.templateChildren.length).toBe(0);
});
