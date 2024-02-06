import { Factory } from "../../src/binding/Factory.js";
import { Binding, BindingManager } from "../../src/binding/Binding.js";
import { ContextIndex } from "../../src/binding/viewModelProperty/ContextIndex.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";

describe("Factory", () => {
  let bindingManager;
  let node;
  let nodePropertyName;
  let viewModel;
  let viewModelPropertyName;
  let filters;

  beforeEach(() => {
    bindingManager = {
      component: {
        filters: {
          in: {},
          out: {},
        }
      }
    };
    node = document.createElement("div");
    nodePropertyName = "contentText";
    viewModel = { value: "value"};
    viewModelPropertyName = "value";
    filters = [];
  });

  describe("create", () => {
    it("should create a Binding object", () => {
      viewModelPropertyName = "$1";
      const binding = Factory.create(
        bindingManager,
        node,
        nodePropertyName,
        viewModel,
        viewModelPropertyName,
        filters
      );

      expect(binding).toBeInstanceOf(Binding);
      expect(binding.nodeProperty).toBeInstanceOf(ElementProperty);
      expect(binding.viewModelProperty).toBeInstanceOf(ContextIndex);
    });
  });
});
