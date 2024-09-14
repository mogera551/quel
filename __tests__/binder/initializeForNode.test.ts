import "jest"
import { initializeForNode } from "../../src/binder/initializeForNode";
import { NodeType, IBindingNode } from "../../src/binder/types";
import { IBinding } from "../../src/binding/types";
import { Checkbox } from "../../src/binding/nodeProperty/Checkbox";
import { Radio } from "../../src/binding/nodeProperty/Radio";

describe("initializeForNode", () => {
  let mockElement: HTMLElement;
  let mockBinding: Pick<IBinding, "defaultEventHandler" | "nodeProperty">;
  let mockDefaultEventHandler: jest.Mock;

  beforeEach(() => {
    mockElement = document.createElement("div");
    mockDefaultEventHandler = jest.fn();
    mockBinding = {
      defaultEventHandler: mockDefaultEventHandler,
      nodeProperty: { name: "oninput", constructor: Checkbox }
    };
  });

  it("should set default event handler for HTMLElement", () => {
    const nodeInfo: Pick<IBindingNode, "nodeType" | "acceptInput" | "defaultProperty"> = {
      nodeType: "HTMLElement",
      acceptInput: true,
      defaultProperty: "oninput"
    };

    const initialize = initializeForNode(nodeInfo);
    initialize(mockElement, [mockBinding]);

    mockElement.dispatchEvent(new Event("input"));
    expect(mockDefaultEventHandler).toHaveBeenCalled();
  });

  it("should not set default event handler if acceptInput is false", () => {
    const nodeInfo: Pick<IBindingNode, "nodeType" | "acceptInput" | "defaultProperty"> = {
      nodeType: "HTMLElement",
      acceptInput: false,
      defaultProperty: "oninput"
    };

    const initialize = initializeForNode(nodeInfo);
    initialize(mockElement, [mockBinding]);

    mockElement.dispatchEvent(new Event("input"));
    expect(mockDefaultEventHandler).not.toHaveBeenCalled();
  });

  it("should set event handler for Radio nodeProperty", () => {
    mockBinding.nodeProperty.constructor = Radio;

    const nodeInfo: Pick<IBindingNode, "nodeType" | "acceptInput" | "defaultProperty"> = {
      nodeType: "HTMLElement",
      acceptInput: true,
      defaultProperty: "oninput"
    };

    const initialize = initializeForNode(nodeInfo);
    initialize(mockElement, [mockBinding]);

    mockElement.dispatchEvent(new Event("input"));
    expect(mockDefaultEventHandler).toHaveBeenCalled();
  });

  it("should not set default event handler if oninput is already bound", () => {
    mockBinding.nodeProperty.name = "oninput";

    const nodeInfo: Pick<IBindingNode, "nodeType" | "acceptInput" | "defaultProperty"> = {
      nodeType: "HTMLElement",
      acceptInput: true,
      defaultProperty: "oninput"
    };

    const initialize = initializeForNode(nodeInfo);
    initialize(mockElement, [mockBinding]);

    mockElement.dispatchEvent(new Event("input"));
    expect(mockDefaultEventHandler).toHaveBeenCalled();
  });

  it("should not set event handler for non-input nodes", () => {
    const nodeInfo: Pick<IBindingNode, "nodeType" | "acceptInput" | "defaultProperty"> = {
      nodeType: "Text",
      acceptInput: true,
      defaultProperty: "oninput"
    };

    const initialize = initializeForNode(nodeInfo);
    initialize(mockElement, [mockBinding]);

    mockElement.dispatchEvent(new Event("input"));
    expect(mockDefaultEventHandler).not.toHaveBeenCalled();
  });
});