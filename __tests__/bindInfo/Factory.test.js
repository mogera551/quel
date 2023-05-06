import { Component } from "../../src/component/Component.js";
import { Factory } from "../../src/bindInfo/Factory.js";
import { Template } from "../../src/bindInfo/Template.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Level2nd } from "../../src/bindInfo/Level2nd.js";
import { Level3rd } from "../../src/bindInfo/Level3rd.js";
import { Checkbox } from "../../src/bindInfo/Checkbox.js";
import { Radio } from "../../src/bindInfo/Radio.js";
import { ClassName } from "../../src/bindInfo/ClassName.js";
import { ComponentBind } from "../../src/bindInfo/Component.js";
import { Event } from "../../src/bindInfo/Event.js";

customElements.define("custom-tag", Component);

const component = { name:"component" };
const viewModel = { 
  name:"viewModel",
  "ccc": [ 10, 20, 30, 40 ],
  "aaa": [ [ 1,2 ], [ 11,22 ], [ 111,222 ] ],
  "aaa.*": undefined,

};
const filters = [];

test("Factory template loop", () => {
  const rootNode = document.createElement("div");
  const node = document.createElement("template");
  rootNode.appendChild(node);
  node.dataset["bind"] = "loop:aaa";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Template).toBe(true);
  expect(bindInfo.node instanceof Comment).toBe(true); // Commentにリプレースされている
  expect(bindInfo.template).toBe(node);
  expect(bindInfo.nodeProperty).toBe("loop");
  expect(bindInfo.nodePropertyElements).toEqual(["loop"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory template if", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  parentNode.appendChild(node);
  node.dataset["bind"] = "if:aaa";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "if",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: [],
  });
  expect(bindInfo instanceof Template).toBe(true);
  expect(bindInfo.node instanceof Comment).toBe(true); // Commentにリプレースされている
  expect(bindInfo.template).toBe(node);
  expect(bindInfo.nodeProperty).toBe("if");
  expect(bindInfo.nodePropertyElements).toEqual(["if"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory template other", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  parentNode.appendChild(node);
  node.dataset["bind"] = "aaa";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node instanceof HTMLTemplateElement).toBe(true);
  expect(bindInfo.template).toBe(undefined);
  expect(bindInfo.nodeProperty).toBe("textContent");
  expect(bindInfo.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory levelTop text", () => {
  const node = document.createTextNode("");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("textContent");
  expect(bindInfo.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory levelTop element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("textContent");
  expect(bindInfo.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory level2nd element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "style.display",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Level2nd).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("style.display");
  expect(bindInfo.nodePropertyElements).toEqual(["style", "display"]);
  expect(bindInfo.nodeProperty1).toBe("style");
  expect(bindInfo.nodeProperty2).toBe("display");
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory level3rd element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "aaa.bbb.ccc",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Level3rd).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("aaa.bbb.ccc");
  expect(bindInfo.nodePropertyElements).toEqual(["aaa", "bbb", "ccc"]);
  expect(bindInfo.nodeProperty1).toBe("aaa");
  expect(bindInfo.nodeProperty2).toBe("bbb");
  expect(bindInfo.nodeProperty3).toBe("ccc");
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory checkbox", () => {
  const node = document.createElement("input");
  node.type = "checkbox";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "checkbox",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Checkbox).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("checkbox");
  expect(bindInfo.nodePropertyElements).toEqual(["checkbox"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory radio", () => {
  const node = document.createElement("input");
  node.type = "radio";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "radio",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Radio).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("radio");
  expect(bindInfo.nodePropertyElements).toEqual(["radio"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory className", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "className.completed",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof ClassName).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("className.completed");
  expect(bindInfo.nodePropertyElements).toEqual(["className", "completed"]);
  expect(bindInfo.className).toBe("completed");
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory Component", () => {
  const node = document.createElement("custom-tag");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "$props.bbb",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof ComponentBind).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("$props.bbb");
  expect(bindInfo.nodePropertyElements).toEqual(["$props", "bbb"]);
  expect(bindInfo.dataNameProperty).toBe("$props");
  expect(bindInfo.dataProperty).toBe("bbb");
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory event", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "onclick",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  expect(bindInfo instanceof Event).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("onclick");
  expect(bindInfo.nodePropertyElements).toEqual(["onclick"]);
  expect(bindInfo.eventType).toBe("click");
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([]);
  expect(bindInfo.indexesString).toBe("");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa\t");
  expect(bindInfo.contextIndexes).toEqual([]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(null);
  expect(bindInfo.parentContextBind).toBe(null);
  expect(bindInfo.positionContextIndexes).toBe(-1);
});

test("Factory template loop child", () => {
  const rootNode = document.createElement("div");
  const templateNode = document.createElement("template");
  rootNode.appendChild(templateNode);
  templateNode.dataset["bind"] = "loop:aaa";
  const templateBind = Factory.create({
    component, 
    node: templateNode, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: null,
    contextIndexes: []
  });

  const node = document.createElement("div");
  node.dataset["bind"] = "aaa.*";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa.*",
    filters, 
    contextBind: templateBind,
    contextIndexes: [0]
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node instanceof HTMLElement).toBe(true);
  expect(bindInfo.element).toBe(node);
  expect(bindInfo.nodeProperty).toBe("textContent");
  expect(bindInfo.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa.*");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([0]);
  expect(bindInfo.indexesString).toBe("0");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa.*\t0");
  expect(bindInfo.contextIndexes).toEqual([0]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(templateBind);
  expect(bindInfo.parentContextBind).toBe(templateBind);
  expect(bindInfo.positionContextIndexes).toBe(0);
});

test("Factory template multi level loop child", () => {
  const rootNode = document.createElement("div");
  const templateNode = document.createElement("template");
  rootNode.appendChild(templateNode);
  templateNode.dataset["bind"] = "loop:ccc";
  const templateBind = Factory.create({
    component, 
    node: templateNode, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "ccc",
    filters, 
    contextBind: null,
    contextIndexes: []
  });
  const templateNode2 = document.createElement("template");
  templateNode.appendChild(templateNode2);
  templateNode2.dataset["bind"] = "loop:aaa";
  const templateBind2 = Factory.create({
    component, 
    node: templateNode2, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    contextBind: templateBind,
    contextIndexes: [1]
  });
  const templateNode3 = document.createElement("template");
  templateNode2.appendChild(templateNode3);
  templateNode3.dataset["bind"] = "loop:aaa.*";
  const templateBind3 = Factory.create({
    component, 
    node: templateNode3, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "aaa.*",
    filters, 
    contextBind: templateBind2,
    contextIndexes: [1, 4]
  });

  const node = document.createElement("div");
  node.dataset["bind"] = "aaa.*.*";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa.*.*",
    filters, 
    contextBind: templateBind3,
    contextIndexes: [1, 4, 9]
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node instanceof HTMLElement).toBe(true);
  expect(bindInfo.element).toBe(node);
  expect(bindInfo.nodeProperty).toBe("textContent");
  expect(bindInfo.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo.component).toBe(component);
  expect(bindInfo.viewModel).toBe(viewModel);
  expect(bindInfo.viewModelProperty).toBe("aaa.*.*");
  expect(bindInfo.contextIndex).toBe(undefined);
  expect(bindInfo.isContextIndex).toBe(false);
  expect(bindInfo.filters).toEqual([]);
  expect(bindInfo.indexes).toEqual([4, 9]);
  expect(bindInfo.indexesString).toBe("4,9");
  expect(bindInfo.viewModelPropertyKey).toBe("aaa.*.*\t4,9");
  expect(bindInfo.contextIndexes).toEqual([1,4,9]);
  expect(bindInfo.lastNodeValue).toBe(undefined);
  expect(bindInfo.lastViewModelValue).toBe(undefined);
  expect(bindInfo.contextBind).toBe(templateBind3);
  expect(bindInfo.parentContextBind).toBe(templateBind3);
  expect(bindInfo.positionContextIndexes).toBe(2);

  const node2 = document.createElement("div");
  node2.dataset["bind"] = "ccc.*";
  const bindInfo2 = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "ccc.*",
    filters, 
    contextBind: templateBind3,
    contextIndexes: [1, 4, 9]
  });
  expect(bindInfo2 instanceof LevelTop).toBe(true);
  expect(bindInfo2.node instanceof HTMLElement).toBe(true);
  expect(bindInfo2.element).toBe(node);
  expect(bindInfo2.nodeProperty).toBe("textContent");
  expect(bindInfo2.nodePropertyElements).toEqual(["textContent"]);
  expect(bindInfo2.component).toBe(component);
  expect(bindInfo2.viewModel).toBe(viewModel);
  expect(bindInfo2.viewModelProperty).toBe("ccc.*");
  expect(bindInfo2.contextIndex).toBe(undefined);
  expect(bindInfo2.isContextIndex).toBe(false);
  expect(bindInfo2.filters).toEqual([]);
  expect(bindInfo2.indexes).toEqual([1]);
  expect(bindInfo2.indexesString).toBe("1");
  expect(bindInfo2.viewModelPropertyKey).toBe("ccc.*\t1");
  expect(bindInfo2.contextIndexes).toEqual([1,4,9]);
  expect(bindInfo2.lastNodeValue).toBe(undefined);
  expect(bindInfo2.lastViewModelValue).toBe(undefined);
  expect(bindInfo2.contextBind).toBe(templateBind3);
  expect(bindInfo2.parentContextBind).toBe(templateBind);
  expect(bindInfo2.positionContextIndexes).toBe(0);

  const node3 = document.createElement("div");
  node3.dataset["bind"] = "ddd.*";
  expect(() => {
    const bindInfo3 = Factory.create({
      component, node, 
      nodeProperty: "textContent",
      viewModel, 
      viewModelProperty: "ddd.*",
      filters, 
      contextBind: templateBind3,
      contextIndexes: [1, 4, 9]
    });
  }).toThrow();
});