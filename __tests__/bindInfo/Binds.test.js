import { Symbols } from "../../src/viewModel/Symbols.js";
import { Binds } from "../../src/bindInfo/Binds.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { Template, TemplateChild } from "../../src/bindInfo/Template.js";

const viewModel = {
  "aaa": [10,20,30],
  "bbb": "100",
  "ccc": [],
  get "aaa.*"() {
    return 10;
  },
  get "ccc.*"() {
    return 10;
  },
  [Symbols.directlyGet](prop, indexes) {
    return this[prop];
  },
  [Symbols.directlySet](prop, indexes, value) {
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

test("Binds getTemplateBinds", () => {
  const binds = [];
  const rootBind = new LevelTop;
  rootBind.component = component;
  rootBind.node = null;
  rootBind.nodeProperty = "value";
  rootBind.viewModel = viewModel;
  rootBind.viewModelProperty = "aaa";
  rootBind.filters = [];
  binds.push(rootBind);
  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds template", () => {
  const rootNode = document.createElement("div");
  const binds = [];

  const templateBind = new Template;
  const templateElement = document.createElement("template");
  rootNode.appendChild(templateElement);
  templateBind.component = component;
  templateBind.node = templateElement;
  templateBind.nodeProperty = "value";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "ccc";
  templateBind.indexes = [];
  templateBind.filters = [];
  binds.push(templateBind);

  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds template", () => {
  const rootNode = document.createElement("div");
  const binds = [];

  const templateBind = new Template;
  const templateElement = document.createElement("template");
  rootNode.appendChild(templateElement);
  templateBind.component = component;
  templateBind.node = templateElement;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "aaa";
  templateBind.indexes = [];
  templateBind.contextIndexes = [];
  templateBind.filters = [];
  templateBind.updateNode();
  binds.push(templateBind);

  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds tree", () => {
  const rootNode = document.createElement("div");
  const binds = [];
  const rootBind = new LevelTop;
  rootBind.component = component;
  rootBind.node = null;
  rootBind.nodeProperty = "value";
  rootBind.viewModel = viewModel;
  rootBind.viewModelProperty = "aaa";
  rootBind.filters = [];
  binds.push(rootBind);

  const templateBind = new Template;
  const templateElement = document.createElement("template");
  rootNode.appendChild(templateElement);
  templateBind.component = component;
  templateBind.node = templateElement;
  templateBind.nodeProperty = "value";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "aaa";
  templateBind.indexes = [];
  templateBind.filters = [];
  binds.push(templateBind);

  const templateBind2 = new Template;
  const templateElement2 = document.createElement("template");
  rootNode.appendChild(templateElement2);
  templateBind2.component = component;
  templateBind2.node = templateElement2;
  templateBind2.nodeProperty = "value";
  templateBind2.viewModel = viewModel;
  templateBind2.viewModelProperty = "bbb";
  templateBind2.indexes = [];
  templateBind2.filters = [];
  binds.push(templateBind2);

  const templateChild = new TemplateChild;
  const templateBind3 = new Template;
  const templateElement3 = document.createElement("template");
  templateElement2.appendChild(templateElement3);
  templateBind3.component = component;
  templateBind3.node = templateElement3;
  templateBind3.nodeProperty = "value";
  templateBind3.viewModel = viewModel;
  templateBind3.viewModelProperty = "bbb.*";
  templateBind3.indexes = [0];
  templateBind3.filters = [];
  templateChild.binds = [templateBind3];
  templateChild.childNodes = [templateElement3];
  templateBind2.templateChildren.push(templateChild);

  const templateBinds = Binds.getTemplateBinds(binds, new Set(["aaa\t", "bbb.*\t0"]));
  expect(templateBinds.length).toBe(2);
  expect(templateBinds[0]).toBe(templateBind);
  expect(templateBinds[1]).toBe(templateBind3);
});

test("Binds applyToNode loop", () => {
  const rootNode = document.createElement("div");
  const binds = [];

  const templateBind = new Template;
  const templateElement = document.createElement("template");
  templateElement.innerHTML = "<div data-bind='aaa.*'><div>"
  rootNode.appendChild(templateElement);
  templateBind.component = component;
  templateBind.node = templateElement;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "aaa";
  templateBind.indexes = [];
  templateBind.contextIndexes = [];
  templateBind.filters = [];
  templateBind.updateNode();
  expect(templateBind.templateChildren.length).toBe(3);
  binds.push(templateBind);

  viewModel.aaa = ["10", "10"];
  Binds.applyToNode(binds, new Set(["aaa\t"]));
  expect(templateBind.templateChildren.length).toBe(2);
  expect(templateBind.templateChildren[0].binds.length).toBe(1);
  expect(templateBind.templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
  expect(templateBind.templateChildren[0].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(templateBind.templateChildren[0].binds[0].node.dataset.bind).toBe("aaa.*");
  expect(templateBind.templateChildren[0].binds[0].component).toBe(component);
  expect(templateBind.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(templateBind.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(templateBind.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(templateBind.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(templateBind.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(templateBind.templateChildren[1].binds.length).toBe(1);
  expect(templateBind.templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
  expect(templateBind.templateChildren[1].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(templateBind.templateChildren[1].binds[0].node.dataset.bind).toBe("aaa.*");
  expect(templateBind.templateChildren[1].binds[0].component).toBe(component);
  expect(templateBind.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(templateBind.templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(templateBind.templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(templateBind.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(templateBind.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
});

test("Binds getTemplateBinds", () => {
  const binds = [];
  const element = document.createElement("div");
  const rootBind = new LevelTop;
  rootBind.component = component;
  rootBind.node = element;
  rootBind.nodeProperty = "textContent";
  rootBind.viewModel = viewModel;
  rootBind.viewModelProperty = "bbb";
  rootBind.indexes = [];
  rootBind.contextIndexes = [];
  rootBind.filters = [];
  rootBind.updateNode();
  binds.push(rootBind);
  expect(element.textContent).toBe("100");

  viewModel.bbb = "200";
  Binds.applyToNode(binds, new Set(["bbb\t"]));
  expect(element.textContent).toBe("200");
});
