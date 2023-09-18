import { generateComponentClass } from "../../src/component/Component.js";
import { BindToDom } from "../../src/binder/BindToDom.js";
import { Filter } from "../../src/filter/Filter.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../../src/view/Templates.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

class CustomTag extends HTMLElement {
  aaa = {
    bbb: {
      ccc: 100
    }
  }
}
customElements.define("custom-tag", CustomTag);
const minimumModule = {html:"", ViewModel:class {}};
customElements.define("my-component", generateComponentClass(minimumModule));

test("BindToDom parseBindText single property default", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "aaa", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);

  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single property default filters", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "aaa|falsey|not|toFixed,2", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([
    Object.assign(new Filter, { name:"falsey", options:[] }),
    Object.assign(new Filter, { name:"not", options:[] }),
    Object.assign(new Filter, { name:"toFixed", options:["2"] }),
  ]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);

  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

});

test("BindToDom parseBindText single property", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "disabled:bbb;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("disabled");
  expect(binds[0].nodePropertyElements).toEqual(["disabled"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("bbb");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[0].contextIndexes).toEqual([]);

  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText multi property", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "aaa; disabled:bbb;", "textContent");

  expect(binds.length).toBe(2);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);

  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1].node).toBe(node);
  expect(binds[1].element).toBe(node);
  expect(binds[1].nodeProperty).toBe("disabled");
  expect(binds[1].nodePropertyElements).toEqual(["disabled"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("bbb");
  expect(binds[1].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single style", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "style.display:bbb;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("style.display");
  expect(binds[0].nodePropertyElements).toEqual(["style", "display"]);
  expect(binds[0].styleName).toEqual("display");
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("bbb");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Checkbox", () => {
  const node = document.createElement("input");
  node.type = "checkbox";
  node.value = "100";
  const viewModel = {
    "aaa": [],
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "checkbox:aaa;", "checked");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("checkbox");
  expect(binds[0].nodePropertyElements).toEqual(["checkbox"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Radio", () => {
  const node = document.createElement("input");
  node.type = "radio";
  node.value = "100";
  const viewModel = {
    "aaa": undefined,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "radio:aaa;", "checked");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("radio");
  expect(binds[0].nodePropertyElements).toEqual(["radio"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single ClassList", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": [],
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "class.zzz:aaa;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("class.zzz");
  expect(binds[0].nodePropertyElements).toEqual(["class", "zzz"]);
  expect(binds[0].className).toBe("zzz");
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single ClassName", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": [],
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "class:aaa;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("class");
  expect(binds[0].nodePropertyElements).toEqual(["class"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Component", () => {
  const parentNode = document.createElement("my-component");
  const node = document.createElement("my-component");
  parentNode.appendChild(node);
  parentNode.viewModel = {
    aaa: 100
  };
  const component = parentNode;
  const viewModel = parentNode.viewModel;
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "props.bbb:aaa;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("props.bbb");
  expect(binds[0].nodePropertyElements).toEqual(["props", "bbb"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Event", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
    double() {
       this["aaa"] *= 2;

    }
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, "onclick:double;", "textContent");

  expect(binds.length).toBe(1);
  expect(binds[0].node).toBe(node);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("onclick");
  expect(binds[0].nodePropertyElements).toEqual(["onclick"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("double");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("double"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("double\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Template if", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "if:bbb";
  Templates.templateByUUID.set(template.dataset.uuid, template);

  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, template.dataset.bind, "");

  expect(binds.length).toBe(1);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("@@|xxxx-xxxx-xxxx-xxxx-0");
  expect(() => binds[0].element).toThrow("not Element");
  expect(binds[0].nodeProperty).toBe("if");
  expect(binds[0].nodePropertyElements).toEqual(["if"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("bbb");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom parseBindText single Template loop", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "loop:bbb";
  Templates.templateByUUID.set(template.dataset.uuid, template);

  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const context = { indexes:[], stack:[] };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, template.dataset.bind, "");

  expect(binds.length).toBe(1);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("@@|xxxx-xxxx-xxxx-xxxx-1");
  expect(() => binds[0].element).toThrow("not Element");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("bbb");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });
});

test("BindToDom applyUpdateNode", () => {
  let calledUpdateNode1 = false;
  let calledUpdateNode2 = false;
  const bind1 = {
    updateNode() {
      calledUpdateNode1 = true;
    }
  };
  const bind2 = {
    updateNode() {
      calledUpdateNode2 = true;
    }
  };
  [bind1, bind2].forEach(BindToDom.applyUpdateNode);
  expect(calledUpdateNode1).toBe(true);
  expect(calledUpdateNode2).toBe(true);
});

test("BindToDom indexes", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "loop:bbb";
  template.dataset.innerHTML = "<div>hoge</div>";
  Templates.templateByUUID.set(template.dataset.uuid, template);

  const node = document.createComment("@@|" + template.dataset.uuid);

  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const context =  { indexes:[100], stack:[{ indexes:[100], pos:0, propName:PropertyName.create("ccc") }] };
  const component = { viewModel };
  const binds = BindToDom.parseBindText(node, component, viewModel, context, template.dataset.bind, "");

  expect(binds.length).toBe(1);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("@@|xxxx-xxxx-xxxx-xxxx-2");
  expect(() => binds[0].element).toThrow("not Element");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("bbb");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("bbb"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[0].contextIndexes).toEqual([100]);
  expect(binds[0].context).toEqual({ indexes:[100], stack:[{ indexes:[100], pos:0, propName:PropertyName.create("ccc") }] });
});

