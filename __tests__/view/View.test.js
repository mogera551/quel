import "../../src/types.js";
import { generateComponentClass } from "../../src/component/Component.js";
import { createViewModel } from "../../src/viewModel/Proxy.js";
//import { NodePropertyType } from "../../src/node/PropertyType.js";
import { View } from "../../src/view/View.js";
import { Module } from "../../src/component/Module.js";
import { TemplateProperty } from "../../src/binding/nodeProperty/TemplateProperty.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { Binding } from "../../src/binding/Binding.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

const minimumModule = {html:"", ViewModel:class {}};
customElements.define("custom-tag", generateComponentClass(minimumModule));

test ("View render no binding ", () => {
  const component = document.createElement("custom-tag");
  const root = document.createElement("div");
  const template = document.createElement("template");
  template.innerHTML = "<div></div>";

  const bindings = View.render(root, component, template);
  expect(bindings).toEqual([]);
  expect(root.innerHTML).toEqual("<div></div>");
});

test ("View render one binding", async () => {
  class ViewModel {
    "aaa" = "100";
  }
  /**
   * @type {Component}
   */
  const component = document.createElement("custom-tag");
  component.viewModel = createViewModel(component, ViewModel);
  component.thread = {
    wakeup() {

    }
  };
  const root = document.createElement("div");
  const template = document.createElement("template");
  template.innerHTML = `<div data-bind="aaa"></div>`;

  const bindings = View.render(root, component, template);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].children).toEqual([]);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.value).toBe("");
  expect(bindings[0].nodeProperty.filteredValue).toBe("");
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");
  expect(root.innerHTML).toEqual(`<div data-bind="aaa"></div>`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(1);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe("100");
});

test ("View render multi binding", async () => {
  class ViewModel {
    "aaa" = "100";
    "bbb" = true;
  }
  /**
   * @type {Component}
   */
  const component = document.createElement("custom-tag");
  component.viewModel = createViewModel(component, ViewModel);
  component.thread = {
    wakeup() {

    }
  };
  const root = document.createElement("div");
  const template = document.createElement("template");
  template.innerHTML = `<div data-bind="aaa; disabled:bbb;"></div>`;

  const bindings = View.render(root, component, template);
  expect(bindings.length).toBe(2);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].children).toEqual([]);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.value).toBe("");
  expect(bindings[0].nodeProperty.filteredValue).toBe("");
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].children).toEqual([]);
  expect(bindings[1].constructor).toBe(Binding);
  expect(bindings[1].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[1].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[1].nodeProperty.name).toBe("disabled");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["disabled"]);
  expect(bindings[1].nodeProperty.applicable).toBe(true);
  expect(bindings[1].nodeProperty.value).toBe(false);
  expect(bindings[1].nodeProperty.filteredValue).toBe(false);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.name).toBe("bbb");
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("bbb"));
  expect(bindings[1].viewModelProperty.value).toBe(true);
  expect(bindings[1].viewModelProperty.filteredValue).toBe(true);

  expect(root.innerHTML).toEqual(`<div data-bind="aaa; disabled:bbb;"></div>`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(2);
  console.log(component.updateSlot.nodeUpdator.queue);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe("100");

  expect(component.updateSlot.nodeUpdator.queue[1].property).toBe("disabled");
  expect(component.updateSlot.nodeUpdator.queue[1].viewModelProperty).toBe("bbb");
  expect(component.updateSlot.nodeUpdator.queue[1].value).toBe(true);
});

test ("View render", async () => {
  class ViewModel {
    "aaa" = [10, 20];
  }
  /**
   * @type {Component}
   */
  const component = document.createElement("custom-tag");
  component.viewModel = createViewModel(component, ViewModel);
  component.thread = {
    wakeup() {

    }
  };

  const template = Module.htmlToTemplate(`
{{ loop:aaa }}
  {{ aaa.* }}
{{ end: }}
  `);

  const root = document.createElement("div");

  const bindings = View.render(root, component, template);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
//  expect(bindings[0].contextBind).toBe(null);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].contextIndexes).toEqual([]);
  expect(bindings[0].eventType).toBe(undefined);
  expect(bindings[0].filters).toEqual([]);
//  expect(bindings[0].parentContextBind).toBe(null);
//  expect(bindings[0].positionContextIndexes).toBe(-1);
//  expect(bindings[0].type).toBe(NodePropertyType.template);
  expect(bindings[0].viewModel).toBe(component.viewModel);
  expect(bindings[0].nodeProperty).toBe("loop");
  expect(bindings[0].viewModelProperty).toBe("aaa");
  expect(bindings[0].children.length).toBe(2);
  expect(bindings[0].children[0].bindings.length).toBe(1);
  expect(bindings[0].children[0].bindings[0].component).toBe(component);
//  expect(bindings[0].children[0].bindings[0].contextBind).toBe(bindings[0]);
  expect(bindings[0].children[0].bindings[0].indexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[0].contextIndexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[0].eventType).toBe(undefined);
  expect(bindings[0].children[0].bindings[0].filters).toEqual([]);
//  expect(bindings[0].children[0].bindings[0].parentContextBind).toBe(bindings[0]);
//  expect(bindings[0].children[0].bindings[0].positionContextIndexes).toBe(0);
//  expect(bindings[0].children[0].bindings[0].type).toBe(NodePropertyType.text);
  expect(bindings[0].children[0].bindings[0].viewModel).toBe(component.viewModel);
  expect(bindings[0].children[0].bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[0].children[0].bindings[0].viewModelProperty).toBe("aaa.*");
  expect(bindings[0].children[1].bindings.length).toBe(1);
  expect(bindings[0].children[1].bindings[0].component).toBe(component);
//  expect(bindings[0].children[1].bindings[0].contextBind).toBe(bindings[0]);
  expect(bindings[0].children[1].bindings[0].indexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[0].contextIndexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[0].eventType).toBe(undefined);
  expect(bindings[0].children[1].bindings[0].filters).toEqual([]);
//  expect(bindings[0].children[1].bindings[0].parentContextBind).toBe(bindings[0]);
//  expect(bindings[0].children[1].bindings[0].positionContextIndexes).toBe(0);
//  expect(bindings[0].children[1].bindings[0].type).toBe(NodePropertyType.text);
  expect(bindings[0].children[1].bindings[0].viewModel).toBe(component.viewModel);
  expect(bindings[0].children[1].bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[0].children[1].bindings[0].viewModelProperty).toBe("aaa.*");

  expect(root.innerHTML.trim()).toEqual(`<!--@@|xxxx-xxxx-xxxx-xxxx-0-->`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(2);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa.*");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe(10);
  expect(component.updateSlot.nodeUpdator.queue[1].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[1].viewModelProperty).toBe("aaa.*");
  expect(component.updateSlot.nodeUpdator.queue[1].value).toBe(20);

});
