import { IfBind } from "../../../src/bindInfo/template/If.js"; 
import { Symbols } from "../../../src/Symbols.js";
import { NodeUpdateData } from "../../../src/thread/NodeUpdator.js";
import { Templates } from "../../../src/view/Templates.js";
import { inputFilters, outputFilters } from "../../../src/filter/Builtin.js";

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

  const template = new IfBind;
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

