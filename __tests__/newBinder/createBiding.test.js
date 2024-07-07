import {expect, jest, test} from '@jest/globals';

jest.unstable_mockModule('../../src/binding/Binding.js', () => {
  return {
    Binding: class Binding {
      static create(bindingManager, node, nodeProperty, nodePropertyConstructor, viewModelProperty, viewModelPropertyConstructor, filters) {
        return {
          bindingManager, node, nodeProperty, nodePropertyConstructor, viewModelProperty, viewModelPropertyConstructor, filters
        };
      }
    },
    BindingManager: class BindingManager {},
  }
});
const { createBinding } = await import("../../src/newBinder/createBinding.js");

describe("createBinding", () => {

  it("should return Binding", () => {
    const bindTextInfo = {
      nodeProperty: "nodeProperty",
      nodePropertyConstructor: "nodePropertyConstructor",
      viewModelProperty: "viewModelProperty",
      viewModelPropertyConstructor: "viewModelPropertyConstructor",
      filters: []
    };
    const bindingManager = "bindingManager";
    const node = "node";
    expect(createBinding(bindTextInfo)(bindingManager, node)).toEqual({
      bindingManager, node, nodeProperty: "nodeProperty", nodePropertyConstructor: "nodePropertyConstructor", viewModelProperty: "viewModelProperty", viewModelPropertyConstructor: "viewModelPropertyConstructor", filters: []
    });
  });
});
