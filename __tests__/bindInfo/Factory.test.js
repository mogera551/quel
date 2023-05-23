import { generateComponentClass } from "../../src/component/Component.js";
import { Factory } from "../../src/bindInfo/Factory.js";
import { TemplateBind } from "../../src/bindInfo/Template.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Level2nd } from "../../src/bindInfo/Level2nd.js";
import { Level3rd } from "../../src/bindInfo/Level3rd.js";
import { AttributeBind } from "../../src/bindInfo/Attribute.js";
import { Checkbox } from "../../src/bindInfo/Checkbox.js";
import { Radio } from "../../src/bindInfo/Radio.js";
import { ClassListBind } from "../../src/bindInfo/Classlist.js/index.js";
import { ComponentBind } from "../../src/bindInfo/Component.js";
import { Event } from "../../src/bindInfo/Event.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../../src/view/Templates.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

const minimumModule = {html:"", ViewModel:class {}};
customElements.define("custom-tag", generateComponentClass(minimumModule));

const component = { name:"component" };
const viewModel = { 
  name:"viewModel",
  "ccc": [ 10, 20, 30, 40 ],
  "aaa": [ [ 1,2 ], [ 11,22 ], [ 111,222 ] ],
  "aaa.*": undefined,

};
const filters = [];

test("Factory template loop", () => {
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const rootNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  rootNode.appendChild(commentNode);

  const bindInfo = Factory.create({
    component, 
    node: commentNode, 
    nodeProperty: "loop",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
  });
  expect(bindInfo instanceof TemplateBind).toBe(true);
  expect(bindInfo.node instanceof Comment).toBe(true);
  expect(bindInfo.template).toBe(templateNode);
  expect(bindInfo.uuid).toBe("xxxx-xxxx-xxxx-xxxx-0");
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory template if", () => {
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "if:aaa";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const rootNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  rootNode.appendChild(commentNode);

  const bindInfo = Factory.create({
    component, 
    node: commentNode, 
    nodeProperty: "if",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
  });
  expect(bindInfo instanceof TemplateBind).toBe(true);
  expect(bindInfo.node instanceof Comment).toBe(true); // Commentにリプレースされている
  expect(bindInfo.template).toBe(templateNode);
  expect(bindInfo.uuid).toBe("xxxx-xxxx-xxxx-xxxx-1");
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory template other", () => {
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "textContent:aaa";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const rootNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  rootNode.appendChild(commentNode);

  const bindInfo = Factory.create({
    component, 
    node: commentNode, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
  });
  expect(bindInfo instanceof LevelTop).toBe(true);
  expect(bindInfo.node instanceof Comment).toBe(true);
  expect(bindInfo.template).toBe(undefined);
  expect(bindInfo.uuid).toBe(undefined);
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory levelTop text", () => {
  const node = document.createTextNode("");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory levelTop element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory level2nd element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "style.display",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory AttributeBind element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "attr.title",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
  });
  expect(bindInfo instanceof AttributeBind).toBe(true);
  expect(bindInfo.node).toBe(node);
  expect(bindInfo.nodeProperty).toBe("attr.title");
  expect(bindInfo.nodePropertyElements).toEqual(["attr", "title"]);
  expect(bindInfo.attrName).toBe("title");
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory level3rd element", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "aaa.bbb.ccc",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
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
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
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
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory className", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "className.completed",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
  });
  expect(bindInfo instanceof ClassListBind).toBe(true);
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });

});

test("Factory Component", () => {
  const node = document.createElement("custom-tag");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "$props.bbb",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory event", () => {
  const node = document.createElement("div");
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "onclick",
    viewModel, 
    viewModelProperty: "aaa",
    filters, 
    context: { indexes:[], stack:[] }
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
  expect(bindInfo.context).toEqual({ indexes:[], stack:[] });
});

test("Factory template loop child", () => {
  const rootNode = document.createElement("div");
  const templateNode = document.createElement("template");
  rootNode.appendChild(templateNode);
  templateNode.dataset["bind"] = "loop:aaa";
  const node = document.createElement("div");
  node.dataset["bind"] = "aaa.*";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa.*",
    filters, 
    context: { indexes:[0], stack:[ { indexes:[0], pos:0, propName:PropertyName.create("aaa") } ] }
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
  expect(bindInfo.context).toEqual({ indexes:[0], stack:[ { indexes:[0], pos:0, propName:PropertyName.create("aaa") } ] });
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
//    contextBind: null,
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
    context: { indexes:[1], stack:[ 
      { indexes:[1], pos:0, propName:PropertyName.create("ccc") },
    ] }
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
    context: { indexes:[1, 4], stack:[ 
      { indexes:[1], pos:0, propName:PropertyName.create("ccc") },
      { indexes:[4], pos:0, propName:PropertyName.create("aaa") },
    ] }
  });

  const node = document.createElement("div");
  node.dataset["bind"] = "aaa.*.*";
  const bindInfo = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "aaa.*.*",
    filters, 
    context: { indexes:[1, 4, 9], stack:[ 
      { indexes:[1], pos:0, propName:PropertyName.create("ccc") },
      { indexes:[4], pos:0, propName:PropertyName.create("aaa") },
      { indexes:[4, 9], pos:1, propName:PropertyName.create("aaa.*") },
    ] }

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

  const node2 = document.createElement("div");
  node2.dataset["bind"] = "ccc.*";
  const bindInfo2 = Factory.create({
    component, node, 
    nodeProperty: "textContent",
    viewModel, 
    viewModelProperty: "ccc.*",
    filters, 
    context: { indexes:[1, 4, 9], stack:[ 
      { indexes:[1], pos:0, propName:PropertyName.create("ccc") },
      { indexes:[4], pos:0, propName:PropertyName.create("aaa") },
      { indexes:[4, 9], pos:1, propName:PropertyName.create("aaa.*") },
    ] }
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

  const node3 = document.createElement("div");
  node3.dataset["bind"] = "ddd.*";
  expect(() => {
    const bindInfo3 = Factory.create({
      component, node, 
      nodeProperty: "textContent",
      viewModel, 
      viewModelProperty: "ddd.*",
      filters, 
      context: { indexes:[1, 4, 9], stack:[ 
        { indexes:[1], pos:0, propName:PropertyName.create("ccc") },
        { indexes:[4], pos:0, propName:PropertyName.create("aaa") },
        { indexes:[4, 9], pos:1, propName:PropertyName.create("aaa.*") },
      ] }
    });
  }).toThrow();
});
