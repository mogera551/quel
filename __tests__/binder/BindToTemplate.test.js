//import { Component } from "../../src/component/Component.js";
import { BindToTemplate } from "../../src/binder/BindToTemplate.js";
import { Symbols } from "../../src/Symbols.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { TemplateBind } from "../../src/bindInfo/Template.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../../src/view/Templates.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

test("BindToTemplate", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "loop:aaa";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof TemplateBind).toBe(true);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(() => binds[0].element).toThrow("not HTMLElement");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
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
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

});

test("BindToTemplate empty", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  expect(binds).toEqual([])
});

test("BindToTemplate throw", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("div");
  node.dataset.bind = "";
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  expect(() => {
    const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  }).toThrow();
});

test("BindToTemplate throw", () => {
  const parentNode = document.createElement("div");
  const template = document.createElement("template");
  template.dataset.uuid = crypto.randomUUID();
  template.dataset.bind = "aaa";
  Templates.templateByUUID.set(template.dataset.uuid, template);
  const node = document.createComment("@@|" + template.dataset.uuid);
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": [],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      }
    }
  };
  expect(() => {
    const binds = BindToTemplate.bind(node, component, { indexes:[], stack:[] });
  }).toThrow("default property undefined");
});

/**
 * ToDo: TemplateChildを持つ場合のテスト
 */