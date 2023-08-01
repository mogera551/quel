import { Symbols } from "../../src/Symbols.js";
import { Binds } from "../../src/bindInfo/Binds.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { TemplateBind,TemplateChild } from "../../src/bindInfo/Template.js";
import { Templates } from "../../src/view/Templates.js";
import { ComponentBind } from "../../src/bindInfo/Component.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

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
  },
  filters: {
    in:inputFilters,
    out:outputFilters,
  }
};

let callbackNotifyForDependentProps = [];
let callbackWriteCallback = [];
const component2 = {
  viewModel: {
    [Symbols.notifyForDependentProps](prop, indexes) {
      callbackNotifyForDependentProps.push({prop, indexes});
    },
    [Symbols.writeCallback](prop, indexes) {
      callbackWriteCallback.push({prop, indexes});
    }

  },
  updateSlot: {
    /**
     * 
     * @param {NodeUpdateData} nodeUpdateData 
     */
    addNodeUpdate(nodeUpdateData) {
      Reflect.apply(nodeUpdateData.updateFunc, nodeUpdateData, []);
    }
  },
  applyToNode() {

  },
  [Symbols.isComponent]: true,
  props: {
    [Symbols.bindProperty](dataProperty, viewModelProperty, indexes) {

    }

  } 
};

test("Binds getTemplateBinds", () => {
  const binds = [];
  const rootBind = new PropertyBind;
  rootBind.component = component;
  rootBind.node = null;
  rootBind.nodeProperty = "value";
  rootBind.viewModel = viewModel;
  rootBind.filters = [];
  rootBind.context = { indexes:[], stack:[] };
  rootBind.viewModelProperty = "aaa";
  binds.push(rootBind);
  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds template", () => {
  const templateElement = document.createElement("template");
  templateElement.dataset.uuid = crypto.randomUUID();
  Templates.templateByUUID.set(templateElement.dataset.uuid, templateElement);

  const commentNode = document.createComment("@@|" + templateElement.dataset.uuid);
  const rootNode = document.createElement("div");
  rootNode.appendChild(commentNode);

  const binds = [];

  const templateBind = new TemplateBind;
  templateBind.component = component;
  templateBind.node = commentNode;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.filters = [];
  templateBind.context = { indexes:[], stack:[] };
  templateBind.viewModelProperty = "ccc";
  binds.push(templateBind);

  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds template", () => {
  const templateElement = document.createElement("template");
  templateElement.dataset.uuid = crypto.randomUUID();
  Templates.templateByUUID.set(templateElement.dataset.uuid, templateElement);

  const commentNode = document.createComment("@@|" + templateElement.dataset.uuid);
  const rootNode = document.createElement("div");
  rootNode.appendChild(commentNode);

  const binds = [];

  const templateBind = new TemplateBind;
  templateBind.component = component;
  templateBind.node = commentNode;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.filters = [];
  templateBind.context = { indexes:[], stack:[] };
  templateBind.viewModelProperty = "aaa";
  templateBind.updateNode();
  binds.push(templateBind);

  const templateBinds = Binds.getTemplateBinds(binds, new Set());
  expect(templateBinds).toEqual([]);
});

test("Binds getTemplateBinds tree", () => {
  const templateElement = document.createElement("template");
  templateElement.dataset.uuid = crypto.randomUUID();
  Templates.templateByUUID.set(templateElement.dataset.uuid, templateElement);

  const templateElement2 = document.createElement("template");
  templateElement2.dataset.uuid = crypto.randomUUID();
  Templates.templateByUUID.set(templateElement2.dataset.uuid, templateElement2);

  const templateElement3 = document.createElement("template");
  templateElement3.dataset.uuid = crypto.randomUUID();
  Templates.templateByUUID.set(templateElement2.dataset.uuid, templateElement3);

  const commentNode = document.createComment("@@|" + templateElement.dataset.uuid);
  const commentNode2 = document.createComment("@@|" + templateElement2.dataset.uuid);
  const commentNode3 = document.createComment("@@|" + templateElement3.dataset.uuid);
  const rootNode = document.createElement("div");
  rootNode.appendChild(commentNode);
//  rootNode.appendChild(commentNode2);
//  rootNode.appendChild(commentNode3);

  const binds = [];

  const rootBind = new PropertyBind;
  rootBind.component = component;
  rootBind.node = null;
  rootBind.nodeProperty = "value";
  rootBind.viewModel = viewModel;
  rootBind.viewModelProperty = "aaa";
  rootBind.filters = [];
  rootBind.context = { indexes:[], stack:[] };
  binds.push(rootBind);

  const templateBind = new TemplateBind;
  templateBind.component = component;
  templateBind.node = commentNode;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "aaa";
  templateBind.context = { indexes:[], stack:[] };
  binds.push(templateBind);

  const templateBind2 = new TemplateBind;
  templateBind2.component = component;
  templateBind2.node = commentNode2;
  templateBind2.nodeProperty = "loop";
  templateBind2.viewModel = viewModel;
  templateBind2.viewModelProperty = "bbb";
  templateBind2.context = { indexes:[0], stack:[{ indexes:[0], pos:0, propName:PropertyName.create("aaa") }] };
  binds.push(templateBind2);

  const templateChild = new TemplateChild;
  templateChild.binds = [templateBind2];
  templateChild.childNodes = [commentNode2];
  templateBind.templateChildren.push(templateChild);

  const templateBind3 = new TemplateBind;
  templateBind3.component = component;
  templateBind3.node = commentNode3;
  templateBind3.nodeProperty = "loop";
  templateBind3.viewModel = viewModel;
  templateBind3.viewModelProperty = "bbb.*";
  templateBind3.context = { 
    indexes:[0, 0], 
    stack:[
      { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
      { indexes:[0], pos:1, propName:PropertyName.create("bbb") },
    ] 
  };

  const templateChild2 = new TemplateChild;
  templateChild2.binds = [templateBind3];
  templateChild2.childNodes = [templateElement3];
  templateBind2.templateChildren.push(templateChild2);

  const templateBinds = Binds.getTemplateBinds(binds, new Set(["aaa\t", "bbb.*\t0"]));
  expect(templateBinds.length).toBe(2);
  expect(templateBinds[0]).toBe(templateBind);
  expect(templateBinds[1]).toBe(templateBind3);
});

test("Binds applyToNode loop", () => {
  const templateElement = document.createElement("template");
  templateElement.dataset.uuid = crypto.randomUUID();
  templateElement.dataset.bind = "aaa";
  templateElement.innerHTML = "<div data-bind='aaa.*'><div>"
  Templates.templateByUUID.set(templateElement.dataset.uuid, templateElement);

  const commentNode = document.createComment("@@|" + templateElement.dataset.uuid);
  const rootNode = document.createElement("div");
  rootNode.appendChild(commentNode);

  const binds = [];

  const templateBind = new TemplateBind;
  templateBind.component = component;
  templateBind.node = commentNode;
  templateBind.nodeProperty = "loop";
  templateBind.viewModel = viewModel;
  templateBind.viewModelProperty = "aaa";
  templateBind.filters = [];
  templateBind.context = { indexes:[], stack:[] };
  templateBind.updateNode();
  expect(templateBind.templateChildren.length).toBe(3);
  binds.push(templateBind);

  viewModel.aaa = ["10", "10"];
  Binds.applyToNode(binds, new Set(["aaa\t"]));
  expect(templateBind.templateChildren.length).toBe(2);
  expect(templateBind.templateChildren[0].binds.length).toBe(1);
  expect(templateBind.templateChildren[0].binds[0] instanceof PropertyBind).toBe(true);
  expect(templateBind.templateChildren[0].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(templateBind.templateChildren[0].binds[0].node.dataset.bind).toBe("aaa.*");
  expect(templateBind.templateChildren[0].binds[0].component).toBe(component);
  expect(templateBind.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(templateBind.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(templateBind.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(templateBind.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(templateBind.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(templateBind.templateChildren[1].binds.length).toBe(1);
  expect(templateBind.templateChildren[1].binds[0] instanceof PropertyBind).toBe(true);
  expect(templateBind.templateChildren[1].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(templateBind.templateChildren[1].binds[0].node.dataset.bind).toBe("aaa.*");
  expect(templateBind.templateChildren[1].binds[0].component).toBe(component);
  expect(templateBind.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(templateBind.templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(templateBind.templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(templateBind.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(templateBind.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
});

test("Binds applyToNode", () => {
  const binds = [];
  const element = document.createElement("div");
  const rootBind = new PropertyBind;
  rootBind.component = component;
  rootBind.node = element;
  rootBind.nodeProperty = "textContent";
  rootBind.nodePropertyElements = rootBind.nodeProperty.split(".");
  rootBind.viewModel = viewModel;
  rootBind.viewModelProperty = "bbb";
  rootBind.filters = [];
  rootBind.context = { indexes:[], stack:[] };
  rootBind.updateNode();
  binds.push(rootBind);

  const componentBind = new ComponentBind;
  componentBind.component = component;
  componentBind.node = component2;
  componentBind.nodeProperty = "props.ccc";
  componentBind.nodePropertyElements = componentBind.nodeProperty.split(".");
  componentBind.viewModel = viewModel;
  componentBind.viewModelProperty = "bbb";
  componentBind.filters = [];
  componentBind.context = { indexes:[], stack:[] };
  componentBind.updateNode();
  binds.push(componentBind);
  
  expect(element.textContent).toBe("100");

  callbackNotifyForDependentProps = [];
  callbackWriteCallback = [];
  viewModel.bbb = "200";
  Binds.applyToNode(binds, new Set(["bbb\t"]));
  expect(element.textContent).toBe("200");
  expect(callbackNotifyForDependentProps).toEqual([{ prop:"$props.ccc", indexes: [] }, { prop:"ccc", indexes: [] }]);
  expect(callbackWriteCallback).toEqual([{ prop:"$props.ccc", indexes: [] }, { prop:"ccc", indexes: [] }]);
});
