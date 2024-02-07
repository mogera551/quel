import { jest } from '@jest/globals';
import { Factory } from "../../src/binding/Factory.js";
import { Binding, BindingManager } from "../../src/binding/Binding.js";
import { ContextIndex } from "../../src/binding/viewModelProperty/ContextIndex.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { ViewModelProperty } from "../../src/binding/viewModelProperty/ViewModelProperty.js";
import { ElementEvent } from '../../src/binding/nodeProperty/ElementEvent.js';
import { ElementStyle } from '../../src/binding/nodeProperty/ElementStyle.js';
import { ElementClass } from '../../src/binding/nodeProperty/ElementClass.js';
import { ElementClassName } from '../../src/binding/nodeProperty/ElementClassName.js';
import { Radio } from '../../src/binding/nodeProperty/Radio.js';
import { Checkbox } from '../../src/binding/nodeProperty/Checkbox.js';
import { ElementAttribute } from '../../src/binding/nodeProperty/ElementAttribute.js';
import { Branch } from '../../src/binding/nodeProperty/Branch.js';
import { RepeatKeyed } from '../../src/binding/nodeProperty/RepeatKeyed.js';
import { Repeat } from '../../src/binding/nodeProperty/Repeat.js';
import { NodeProperty } from '../../src/binding/nodeProperty/NodeProperty.js';

describe("Factory", () => {
  let bindingManager;
  let node;
  let nodePropertyName;
  let viewModel;
  let viewModelPropertyName;
  let filters;
  let Binding_create;
  let retBinding = {};

  beforeEach(() => {
    bindingManager = {
      component: {
        filters: {
          in: {},
          out: {},
        },
        viewModel: {
          value: "value",
          func: () => {},
        },
        useKeyed: true,
      }
    };
    node = document.createElement("div");
    nodePropertyName = "contentText";
    viewModel = bindingManager.component.viewModel;
    viewModelPropertyName = "value";
    filters = [];
    Binding_create = jest.spyOn(Binding, "create").mockImplementation(
      (bindingManager, node, nodePropertyName, classOfNodeProperty, viewModelPropertyName, classOfViewModelProperty, filters) => {
        return retBinding;

      }
    );

  });

  describe("create", () => {
    it("should create a Binding object, bind text node to view model property", () => {
      Binding_create.mockClear();
      node = document.createTextNode("");
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(NodeProperty);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind element to context index", () => {
      Binding_create.mockClear();
      viewModelPropertyName = "$1";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementProperty);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ContextIndex);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });
    it("should create a Binding object, bind element to view model property", () => {
      Binding_create.mockClear();
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementProperty);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind event element to view model property", () => {
      Binding_create.mockClear();
      nodePropertyName = "onclick";
      viewModelPropertyName = "func";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementEvent);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind event element attribute to view model property", () => {
      Binding_create.mockClear();
      nodePropertyName = "attr.name";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementAttribute);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind element style to view model property", () => {
      Binding_create.mockClear();
      nodePropertyName = "style.color";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementStyle);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind element class to view model property", () => {
      Binding_create.mockClear();
      nodePropertyName = "class.completed";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementClass);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind element class name to view model property", () => {
      Binding_create.mockClear();
      nodePropertyName = "class";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(ElementClassName);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind radio to view model property", () => {
      Binding_create.mockClear();
      const input = document.createElement("input");
      input.type = "radio";
      input.value = "value";
      nodePropertyName = "radio";
      const binding = Factory.create(
        bindingManager,
        input,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(input);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(Radio);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind checkbox to view model property", () => {
      Binding_create.mockClear();
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = "value";
      nodePropertyName = "checkbox";
      const binding = Factory.create(
        bindingManager,
        input,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(input);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(Checkbox);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind template with if to view model property", () => {
      Binding_create.mockClear();
      node = document.createComment("");
      nodePropertyName = "if";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(Branch);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind template with loop to view model property, use keyed", () => {
      bindingManager.component.useKeyed = true;    
      Binding_create.mockClear();
      node = document.createComment("");
      nodePropertyName = "loop";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(RepeatKeyed);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should create a Binding object, bind template with loop to view model property, not use keyed", () => {   
      bindingManager.component.useKeyed = false;
      Binding_create.mockClear();
      node = document.createComment("");
      nodePropertyName = "loop";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBe(retBinding);
      expect(Binding_create.mock.calls.length).toBe(1);
      expect(Binding_create.mock.calls[0][0]).toBe(bindingManager);
      expect(Binding_create.mock.calls[0][1]).toBe(node);
      expect(Binding_create.mock.calls[0][2]).toBe(nodePropertyName);
      expect(Binding_create.mock.calls[0][3]).toBe(Repeat);
      expect(Binding_create.mock.calls[0][4]).toBe(viewModelPropertyName);
      expect(Binding_create.mock.calls[0][5]).toBe(ViewModelProperty);
      expect(Binding_create.mock.calls[0][6]).toBe(filters);
    });

    it("should throw error for unknown node property", () => {
      node = document.createComment("");
      nodePropertyName = "unknown";
      expect(() => {
        Factory.create(
          bindingManager,
          node,
          nodePropertyName,
          viewModel,
          viewModelPropertyName,
          filters
        );
      }).toThrow("Factory: unknown node property unknown");
    });

  });
});
