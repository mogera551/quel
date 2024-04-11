import { jest } from '@jest/globals';
import { BindingManager } from "../../../src/binding/Binding.js";
import { Branch } from "../../../src/binding/nodeProperty/Branch.js";
import { utils } from "../../../src/utils.js";
import { Templates } from "../../../src/view/Templates.js";

describe("Branch", () => {
  let branch;
  let uuid = utils.createUUID();
  let template1, template2;
  let binding;

  beforeEach(() => {
    Templates.templateByUUID.clear();
    template1 = document.createElement("template");
    Templates.templateByUUID.set(uuid, template1);
    Templates.templateByUUID.set(utils.createUUID(), template2);
    // Create a new instance of TemplateProperty before each test
    const node = document.createComment(`@@|${uuid}`);
    const name = "if"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    binding = {
      component: {},
      children: [],
      appendChild: () => {},
    }; // Mock binding object
    branch = new Branch(binding, node, name, filters, inputFilterFuncs);
  });

  it("should have a default value", () => {
    expect(branch.value).toBe(false);
  });

  it("should set to value property", () => {
    const retBindingManager = {
      dispose: () => {},
      applyToNode: () => {},
      registerBindingsToSummary: () => {},
    }
    const bindingManager_create = jest.spyOn(BindingManager, "create").mockImplementation((component, template, binding) => {
      return retBindingManager;
    });
    const bindingManager_dispose = jest.spyOn(retBindingManager, "dispose").mockImplementation(() => {
    });
    const bindingManager_applyToNode = jest.spyOn(retBindingManager, "applyToNode").mockImplementation(() => {
    });
    const bindingManager_registerBindingsToSummary = jest.spyOn(retBindingManager, "registerBindingsToSummary").mockImplementation(() => {
    });
    const binding_appendChild = jest.spyOn(binding, "appendChild").mockImplementation((bindingManager) => {
      binding.children.push(bindingManager);
    });

    bindingManager_create.mockClear();
    bindingManager_dispose.mockClear();
    bindingManager_applyToNode.mockClear();
    bindingManager_registerBindingsToSummary.mockClear();
    binding_appendChild.mockClear();
    const trueValue = true;
    branch.value = trueValue;
    expect(branch.value).toBe(trueValue);
    expect(bindingManager_create.mock.calls.length).toBe(1);
    expect(bindingManager_create.mock.calls[0]).toEqual([binding.component, template1, binding]);
    expect(binding_appendChild.mock.calls.length).toBe(1);
    expect(binding_appendChild.mock.calls[0]).toEqual([retBindingManager]);
    expect(bindingManager_registerBindingsToSummary.mock.calls.length).toBe(1);
    expect(bindingManager_registerBindingsToSummary.mock.calls[0]).toEqual([]);
    expect(bindingManager_applyToNode.mock.calls.length).toBe(1);
    expect(bindingManager_applyToNode.mock.calls[0]).toEqual([]);
    expect(bindingManager_dispose.mock.calls.length).toBe(0);
    expect(binding.children.length).toBe(1);
    expect(binding.children[0]).toBe(retBindingManager);

    bindingManager_create.mockClear();
    bindingManager_dispose.mockClear();
    bindingManager_applyToNode.mockClear();
    binding_appendChild.mockClear();
    const falseValue = false;
    branch.value = falseValue;
    expect(branch.value).toBe(falseValue);
    expect(bindingManager_dispose.mock.calls.length).toBe(1);
    expect(bindingManager_dispose.mock.calls[0]).toEqual([]);
    expect(bindingManager_applyToNode.mock.calls.length).toBe(0);
    expect(bindingManager_create.mock.calls.length).toBe(0);
    expect(binding_appendChild.mock.calls.length).toBe(0);
    expect(binding.children.length).toBe(0);

    bindingManager_create.mockClear();
    bindingManager_dispose.mockClear();
    bindingManager_applyToNode.mockClear();
    binding_appendChild.mockClear();
    branch.value = falseValue;
    expect(branch.value).toBe(falseValue);
    expect(bindingManager_dispose.mock.calls.length).toBe(0);
    expect(bindingManager_create.mock.calls.length).toBe(0);
    expect(binding_appendChild.mock.calls.length).toBe(0);
    expect(bindingManager_applyToNode.mock.calls.length).toBe(0);
    expect(binding.children.length).toBe(0);

    branch.value = trueValue;
    expect(branch.value).toBe(trueValue);

    bindingManager_create.mockClear();
    bindingManager_dispose.mockClear();
    bindingManager_applyToNode.mockClear();
    binding_appendChild.mockClear();
    branch.value = trueValue;
    expect(branch.value).toBe(trueValue);
    expect(bindingManager_dispose.mock.calls.length).toBe(0);
    expect(bindingManager_create.mock.calls.length).toBe(0);
    expect(binding_appendChild.mock.calls.length).toBe(0);
    expect(bindingManager_applyToNode.mock.calls.length).toBe(1);
    expect(bindingManager_applyToNode.mock.calls[0]).toEqual([]);
    expect(binding.children.length).toBe(1);
    expect(binding.children[0]).toBe(retBindingManager);

  });

  it("should throw error for invalid property name", () => {
    const name = "notIf"; // Mock property name
    expect(() => {
      new Branch(binding, document.createComment(`@@|${uuid}`), name, [], {});
    }).toThrow(`Branch: invalid property name ${name}`);
  });

  it("should throw error for invalid value", () => {
    expect(() => {
      branch.value = "invalidValue";
    }).toThrow("Branch: value is not boolean");
  });

  it("should same check always returned false", () => {
    expect(branch.isSameValue(true)).toBe(false);
    expect(branch.isSameValue(false)).toBe(false);
  });

});
