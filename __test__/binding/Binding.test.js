import { jest } from '@jest/globals';
import { Binding, BindingManager } from '../../src/binding/Binding';
import { ElementProperty } from '../../src/binding/nodeProperty/ElementProperty';
import { ViewModelProperty } from '../../src/binding/viewModelProperty/ViewModelProperty';
import { NewLoopContext } from '../../src/loopContext/NewLoopContext';
import { Symbols } from '../../src/Symbols';

describe('src/binding/Binding.Binding', () => {
  const bindingManager = {
    component: {
      viewModel: {
        value:"100",
        value2:200,
        values:[100,200,300],
        values2:[1000,2000,3000,4000],
        points: "0,0 20,10 10,20",
        click: () => {},
        [Symbols.directlyGet]: function (name, indexes) {
          return (indexes && indexes.length > 0) ? this[name][indexes.at(-1)] : this[name];
        },
        [Symbols.directlySet]: function (name, indexes, value) {
          if (indexes && indexes.length > 0) {
            this[name][indexes.at(-1)] = value;
            return true;
          } else {
            this[name] = value;
            return true;
          }
        },
      },
      filters: {
        in:{}, out:{}
      },
      bindingSummary: {
        bindings: new Set(),
        updatedBindings: new Set(),
      },
      updateSlot: {},
    },
    newLoopContext: undefined
  }
  const div = document.createElement("div");
  const binding = new Binding(bindingManager, div, "textContent", ElementProperty, "value", ViewModelProperty, []);
  test("construtor", () => {
    expect(binding.id).toBe(Binding.seq);
    expect(binding.bindingManager).toBe(bindingManager);
    expect(binding.nodeProperty).toBeInstanceOf(ElementProperty);
    expect(binding.nodeProperty.applicable).toBe(true);
    expect(binding.nodeProperty.name).toBe("textContent");
    expect(binding.nodeProperty.node).toBe(div);
    expect(binding.nodeProperty.binding).toBe(binding);
    expect(binding.nodeProperty.filterFuncs).toEqual({});
    expect(binding.nodeProperty.filters).toEqual([]);
    expect(binding.viewModelProperty).toBeInstanceOf(ViewModelProperty);
    expect(binding.viewModelProperty.applicable).toBe(true);
    expect(binding.viewModelProperty.name).toBe("value");
    expect(binding.viewModelProperty.binding).toBe(binding);
    expect(binding.viewModelProperty.filterFuncs).toEqual({});
    expect(binding.viewModelProperty.filters).toEqual([]);
    expect(binding.component).toBe(bindingManager.component);
    expect(binding.newLoopContext).toBe(undefined);
    expect(binding.children).toEqual([]);
    expect(binding.expandable).toEqual(false);
    expect(binding.isSelectValue).toEqual(false);
  });

  test("initialize", () => {
    const nodeProperty_initialize = jest.spyOn(binding.nodeProperty, "initialize").mockImplementation(() => {
      return;
    });
    const viewModelProperty_initialize = jest.spyOn(binding.viewModelProperty, "initialize").mockImplementation(() => {
      return;
    });
    binding.initialize();
    expect(nodeProperty_initialize.mock.calls.length).toBe(1);
    expect(viewModelProperty_initialize.mock.calls.length).toBe(1);
    nodeProperty_initialize.mockRestore();
    viewModelProperty_initialize.mockRestore();
  });

  test("applyToNode normal", () => {
    bindingManager.component.bindingSummary.updatedBindings.clear();
    binding.nodeProperty.node.textContent = "";
    expect(binding.nodeProperty.applicable).toBe(true);
    expect(binding.nodeProperty.isSameValue(binding.viewModelProperty.filteredValue)).toBe(false);
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(false);
    binding.applyToNode();
    expect(binding.nodeProperty.node.textContent).toBe("100");
    expect(binding.nodeProperty.value).toBe("100");
    expect(binding.nodeProperty.isSameValue(binding.viewModelProperty.filteredValue)).toBe(true);
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(true);
    binding.applyToNode();
    expect(binding.nodeProperty.value).toBe("100");
    bindingManager.component.bindingSummary.updatedBindings.clear();
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(false);
    binding.applyToNode();
    expect(binding.nodeProperty.value).toBe("100");
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(true);
  });
  test("applyToNode no applicable", () => {
    const nodeProperty_applicable = jest.spyOn(binding.nodeProperty, "applicable", "get").mockImplementation(() => {
      return false;
    });
    bindingManager.component.bindingSummary.updatedBindings.clear();
    binding.nodeProperty.node.textContent = "";
    expect(binding.nodeProperty.applicable).toBe(false);
    expect(binding.nodeProperty.isSameValue(binding.viewModelProperty.filteredValue)).toBe(false);
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(false);
    binding.applyToNode();
    expect(binding.nodeProperty.value).toBe("");
    expect(binding.nodeProperty.isSameValue(binding.viewModelProperty.filteredValue)).toBe(false);
    expect(bindingManager.component.bindingSummary.updatedBindings.has(binding)).toBe(true);
  });

  test("applyToChildNodes", () => {
    const nodeProperty_applyToChildNodes = jest.spyOn(binding.nodeProperty, "applyToChildNodes").mockImplementation(() => {
      return;
    });
    binding.applyToChildNodes(new Set([0]));
    expect(nodeProperty_applyToChildNodes.mock.calls.length).toBe(1);
    expect(nodeProperty_applyToChildNodes.mock.calls[0]).toEqual([new Set([0])]);
    nodeProperty_applyToChildNodes.mockRestore();
  });

});