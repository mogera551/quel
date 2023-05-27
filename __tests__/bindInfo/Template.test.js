import { TemplateBind, TemplateChild } from "../../src/bindInfo/Template.js"; 
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../../src/view/Templates.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { TextBind } from "../../src/bindInfo/Text.js";
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
  },
  filters: {
    in:inputFilters,
    out:outputFilters,
  }
};

test("Template if", () => {
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "if:bbb";
  templateNode.innerHTML = "<div class='bbb_is_true'>bbb is true</div>";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "if";
  template.viewModel = viewModel;
  template.viewModelProperty = "bbb";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(template.node instanceof Comment).toBe(true);
  expect(template.template instanceof HTMLTemplateElement).toBe(true);
  expect(template.uuid).toBe("xxxx-xxxx-xxxx-xxxx-0");

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
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'>aaa.* is true</div>";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(template.node instanceof Comment).toBe(true);
  expect(template.template instanceof HTMLTemplateElement).toBe(true);
  expect(template.uuid).toBe("xxxx-xxxx-xxxx-xxxx-1");

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
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@:aaa.*--></div>";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  viewModel.aaa = [10,20,30];

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(template.node instanceof Comment).toBe(true);
  expect(template.template instanceof HTMLTemplateElement).toBe(true);
  expect(template.uuid).toBe("xxxx-xxxx-xxxx-xxxx-2");

  template.updateNode();
  expect(template.templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(template.templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0] instanceof TextBind).toBe(true);
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
  expect(template.templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof TextBind).toBe(true);
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
  const templateNode2 = document.createElement("template");
  templateNode2.dataset.uuid = crypto.randomUUID();
  templateNode2.dataset.bind = "loop:ccc.*";
  templateNode2.innerHTML = `
  <div class='ccc___is_exists'><!--@@:ccc.*.*--></div>
`;
  Templates.templateByUUID.set(templateNode2.dataset.uuid, templateNode2);

  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:ccc";
  templateNode.innerHTML = `
<!--@@|${templateNode2.dataset.uuid}-->
`;
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  viewModel.ccc = [[11,22],[111,222]];

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "ccc";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(template.node instanceof Comment).toBe(true);
  expect(template.template instanceof HTMLTemplateElement).toBe(true);
  expect(template.uuid).toBe("xxxx-xxxx-xxxx-xxxx-4");

  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[0].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-3");

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[1].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-3");

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
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
  expect(template.templateChildren[0].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[0].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-3");

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(3);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ccc.*.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[2].binds[0] instanceof TextBind).toBe(true);
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
  const templateNode2 = document.createElement("template");
  templateNode2.dataset.uuid = crypto.randomUUID();
  templateNode2.dataset.bind = "loop:ddd";
  templateNode2.innerHTML = `
  <div class='aaa___is_exists'><!--@@:aaa.*--></div>
`;
  Templates.templateByUUID.set(templateNode2.dataset.uuid, templateNode2);

  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = `
<!--@@|${templateNode2.dataset.uuid}-->
`;
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  viewModel.aaa = [10,20];
  viewModel.ddd = [30,40];

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(template.node instanceof Comment).toBe(true);
  expect(template.template instanceof HTMLTemplateElement).toBe(true);
  expect(template.uuid).toBe("xxxx-xxxx-xxxx-xxxx-6");

  template.updateNode();
  expect(template.templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[0].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[1].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
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
  expect(template.templateChildren[0].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[0].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[0].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[0].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");

  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0, 0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].indexes).toEqual([0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([0, 1]);

  expect(template.templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[1].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[1].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[1].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");

  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1, 1]);

  expect(template.templateChildren[2].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0] instanceof TemplateBind).toBe(true);
  expect(template.templateChildren[2].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].node instanceof Comment).toBe(true);
  expect(template.templateChildren[2].binds[0].nodeProperty).toBe("loop");
  expect(template.templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].viewModelProperty).toBe("ddd");
  expect(template.templateChildren[2].binds[0].indexes).toEqual([]);
  expect(template.templateChildren[2].binds[0].contextIndexes).toEqual([2]);
  expect(template.templateChildren[2].binds[0].template instanceof HTMLTemplateElement).toBe(true);
  expect(template.templateChildren[2].binds[0].uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");

  expect(template.templateChildren[2].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0] instanceof TextBind).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].node instanceof Text).toBe(true);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].indexes).toEqual([2]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([2, 0]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0] instanceof TextBind).toBe(true);
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
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@:aaa.*--></div>";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  viewModel.aaa = [10,20,30];

  const template = new TemplateBind;

  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loopp";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };
  expect(() => {
    template.updateNode();
  }).toThrow();
});

test("Template loop array undefined", () => {
  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = "<div class='aaa__is_exists'><!--@@:aaa.*--></div>";
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);

  viewModel.aaa = undefined;

  const template = new TemplateBind;

  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };

  template.updateNode();
  expect(template.templateChildren.length).toBe(0);
});

test("Template loop changeIndexes", () => {
  const templateNode3 = document.createElement("template");
  templateNode3.dataset.uuid = crypto.randomUUID();
  templateNode3.dataset.bind = "loop:ccc.*";
  templateNode3.innerHTML = "<!--@@:ccc.*.*-->";
  Templates.templateByUUID.set(templateNode3.dataset.uuid, templateNode3);

  const templateNode2 = document.createElement("template");
  templateNode2.dataset.uuid = crypto.randomUUID();
  templateNode2.dataset.bind = "loop:ccc";
  templateNode2.innerHTML = `<!--@@|${templateNode3.dataset.uuid}-->`;
  Templates.templateByUUID.set(templateNode2.dataset.uuid, templateNode2);

  const templateNode = document.createElement("template");
  templateNode.dataset.uuid = crypto.randomUUID();
  templateNode.dataset.bind = "loop:aaa";
  templateNode.innerHTML = `<!--@@|${templateNode2.dataset.uuid}-->`;
  Templates.templateByUUID.set(templateNode.dataset.uuid, templateNode);

  const parentNode = document.createElement("div");
  const commentNode = document.createComment("@@|" + templateNode.dataset.uuid);
  parentNode.appendChild(commentNode);


  viewModel.aaa = [10,20,30];
  viewModel.ccc = [
    [11,21],
    [12,22],
  ];

  const template = new TemplateBind;
  template.component = component;
  template.node = commentNode;
  template.nodeProperty = "loop";
  template.viewModel = viewModel;
  template.viewModelProperty = "aaa";
  template.filters = [];
  template.context = { indexes:[], stack:[] };

  template.updateNode();
  expect(template.templateChildren.length).toBe(3);
  expect(template.templateChildren[0].context.indexes).toEqual([0]);
  expect(template.templateChildren[0].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([0,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([0,0,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([0,0,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([0,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([0,1,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([0,1,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[1].context.indexes).toEqual([1]);
  expect(template.templateChildren[1].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([1,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([1,0,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([1,0,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([1,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([1,1,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([1,1,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[1], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[2].context.indexes).toEqual([2]);
  expect(template.templateChildren[2].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.indexes).toEqual([2,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([2,0,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([2,0,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[2].binds[0].templateChildren[1].context.indexes).toEqual([2,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds.length).toBe(1);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren.length).toBe(2);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([2,1,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([2,1,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[2], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  template.changeIndexes(PropertyName.create("aaa"), 5);
  expect(template.templateChildren[0].context.indexes).toEqual([5]);
  expect(template.templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([5,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([5,0,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([5,0,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  expect(template.templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([5,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([5,1,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([5,1,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].context.indexes).toEqual([6]);
  expect(template.templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([6,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([6,0,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([6,0,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([6,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([6,1,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([6,1,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].context.indexes).toEqual([7]);
  expect(template.templateChildren[2].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.indexes).toEqual([7,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([7,0,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([7,0,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[0], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[0,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].context.indexes).toEqual([7,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([7,1,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([7,1,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[1], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[1,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

  template.changeIndexes(PropertyName.create("ccc"), 3);
  expect(template.templateChildren[0].context.indexes).toEqual([5]);
  expect(template.templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([5,3]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([5,3,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([5,3,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([5,4]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([5,4,0]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([5,4,1]);
  expect(template.templateChildren[0].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[5], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].context.indexes).toEqual([6]);
  expect(template.templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([6,3]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([6,3,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([6,3,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([6,4]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([6,4,0]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([6,4,1]);
  expect(template.templateChildren[1].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[6], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].context.indexes).toEqual([7]);
  expect(template.templateChildren[2].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") }
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.indexes).toEqual([7,3]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.indexes).toEqual([7,3,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.indexes).toEqual([7,3,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[0].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[3], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[3,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].context.indexes).toEqual([7,4]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.indexes).toEqual([7,4,0]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[0].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,0], pos:2, propName:PropertyName.create("ccc.*") },
  ]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.indexes).toEqual([7,4,1]);
  expect(template.templateChildren[2].binds[0].templateChildren[1].binds[0].templateChildren[1].context.stack).toEqual([
    { indexes:[7], pos:0, propName:PropertyName.create("aaa") },
    { indexes:[4], pos:1, propName:PropertyName.create("ccc") },
    { indexes:[4,1], pos:2, propName:PropertyName.create("ccc.*") },
  ]);

});

