import "../../src/types.js";
import { generateComponentClass } from "../../src/component/Component.js";
import { createViewModel } from "../../src/viewModel/Proxy.js";
//import { NodePropertyType } from "../../src/node/PropertyType.js";
import { View } from "../../src/view/View.js";
import { Module } from "../../src/component/Module.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

const minimumModule = {html:"", ViewModel:class {}};
customElements.define("custom-tag", generateComponentClass(minimumModule));

test ("View render", () => {
  const component = document.createElement("custom-tag");
  const root = document.createElement("div");
  const template = document.createElement("template");
  template.innerHTML = "<div></div>";

  const binds = View.render(root, component, template);
  expect(binds).toEqual([]);
  expect(root.innerHTML).toEqual("<div></div>");
});

test ("View render", async () => {
  class ViewModel {
    "aaa" = 100;
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

  const binds = View.render(root, component, template);
  expect(binds.length).toBe(1);
  expect(binds[0].component).toBe(component);
//  expect(binds[0].contextBind).toBe(null);
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].eventType).toBe(undefined);
  expect(binds[0].filters).toEqual([]);
//  expect(binds[0].parentContextBind).toBe(null);
//  expect(binds[0].positionContextIndexes).toBe(-1);
//  expect(binds[0].type).toBe(NodePropertyType.property);
  expect(binds[0].viewModel).toBe(component.viewModel);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(root.innerHTML).toEqual(`<div data-bind="aaa"></div>`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(1);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe(100);
});

test ("View render", async () => {
  class ViewModel {
    "aaa" = 100;
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

  const binds = View.render(root, component, template);
  expect(binds.length).toBe(2);
  expect(binds[0].component).toBe(component);
//  expect(binds[0].contextBind).toBe(null);
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].eventType).toBe(undefined);
  expect(binds[0].filters).toEqual([]);
//  expect(binds[0].parentContextBind).toBe(null);
//  expect(binds[0].positionContextIndexes).toBe(-1);
//  expect(binds[0].type).toBe(NodePropertyType.property);
  expect(binds[0].viewModel).toBe(component.viewModel);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].viewModelProperty).toBe("aaa");

  expect(binds[1].component).toBe(component);
//  expect(binds[1].contextBind).toBe(null);
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].eventType).toBe(undefined);
  expect(binds[1].filters).toEqual([]);
//  expect(binds[1].parentContextBind).toBe(null);
//  expect(binds[1].positionContextIndexes).toBe(-1);
//  expect(binds[1].type).toBe(NodePropertyType.property);
  expect(binds[1].viewModel).toBe(component.viewModel);
  expect(binds[1].nodeProperty).toBe("disabled");
  expect(binds[1].viewModelProperty).toBe("bbb");

  expect(root.innerHTML).toEqual(`<div data-bind="aaa; disabled:bbb;"></div>`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(2);
  console.log(component.updateSlot.nodeUpdator.queue);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe(100);

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

  const binds = View.render(root, component, template);
  expect(binds.length).toBe(1);
  expect(binds[0].component).toBe(component);
//  expect(binds[0].contextBind).toBe(null);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].eventType).toBe(undefined);
  expect(binds[0].filters).toEqual([]);
//  expect(binds[0].parentContextBind).toBe(null);
//  expect(binds[0].positionContextIndexes).toBe(-1);
//  expect(binds[0].type).toBe(NodePropertyType.template);
  expect(binds[0].viewModel).toBe(component.viewModel);
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].templateChildren.length).toBe(2);
  expect(binds[0].templateChildren[0].binds.length).toBe(1);
  expect(binds[0].templateChildren[0].binds[0].component).toBe(component);
//  expect(binds[0].templateChildren[0].binds[0].contextBind).toBe(binds[0]);
  expect(binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[0].eventType).toBe(undefined);
  expect(binds[0].templateChildren[0].binds[0].filters).toEqual([]);
//  expect(binds[0].templateChildren[0].binds[0].parentContextBind).toBe(binds[0]);
//  expect(binds[0].templateChildren[0].binds[0].positionContextIndexes).toBe(0);
//  expect(binds[0].templateChildren[0].binds[0].type).toBe(NodePropertyType.text);
  expect(binds[0].templateChildren[0].binds[0].viewModel).toBe(component.viewModel);
  expect(binds[0].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("aaa.*");
  expect(binds[0].templateChildren[1].binds.length).toBe(1);
  expect(binds[0].templateChildren[1].binds[0].component).toBe(component);
//  expect(binds[0].templateChildren[1].binds[0].contextBind).toBe(binds[0]);
  expect(binds[0].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[0].eventType).toBe(undefined);
  expect(binds[0].templateChildren[1].binds[0].filters).toEqual([]);
//  expect(binds[0].templateChildren[1].binds[0].parentContextBind).toBe(binds[0]);
//  expect(binds[0].templateChildren[1].binds[0].positionContextIndexes).toBe(0);
//  expect(binds[0].templateChildren[1].binds[0].type).toBe(NodePropertyType.text);
  expect(binds[0].templateChildren[1].binds[0].viewModel).toBe(component.viewModel);
  expect(binds[0].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("aaa.*");

  expect(root.innerHTML.trim()).toEqual(`<!--@@|xxxx-xxxx-xxxx-xxxx-0-->`);
  expect(component.updateSlot.nodeUpdator.queue.length).toBe(2);
  expect(component.updateSlot.nodeUpdator.queue[0].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[0].viewModelProperty).toBe("aaa.*");
  expect(component.updateSlot.nodeUpdator.queue[0].value).toBe(10);
  expect(component.updateSlot.nodeUpdator.queue[1].property).toBe("textContent");
  expect(component.updateSlot.nodeUpdator.queue[1].viewModelProperty).toBe("aaa.*");
  expect(component.updateSlot.nodeUpdator.queue[1].value).toBe(20);

});
