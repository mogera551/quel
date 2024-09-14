import "jest";
import { createBindings } from "../../src/binder/createBindings";
import { IBindingNode } from "../../src/binder/types";
import { IContentBindings, IBinding, IStateProperty, INodeProperty } from "../../src/binding/types";
import { findNodeByNodeRoute } from "../../src/binder/findNodeByNodeRoute";
import { IFilterText } from "../../src/filter/types";

jest.mock("../../src/binder/findNodeByNodeRoute");

describe("createBindings", () => {
  let content: DocumentFragment;
  let contentBindings: IContentBindings;
  let bindingNodes: Pick<IBindingNode, "nodeRoute" | "bindTexts" | "initializeForNode">[];

  beforeEach(() => {
    content = document.createDocumentFragment();
    content.appendChild(document.createElement("div"));
    content.appendChild(document.createElement("p"));
    contentBindings = {} as IContentBindings;
    const nodePropertyConstructor = jest.fn().mockReturnValue({} as INodeProperty);
    const statePropertyConstructor = jest.fn().mockReturnValue({} as IStateProperty);
    const nodeProperty: string = "nodeProperty";
    const stateProperty: string = "stateProperty";
    const inputFilters: IFilterText[] = [];
    const outputFilters: IFilterText[] = [];
    bindingNodes = [
      {
        nodeRoute: [0],
        bindTexts: [
          {
            nodeProperty,
            stateProperty,
            inputFilters,
            outputFilters,
            nodePropertyConstructor,
            statePropertyConstructor,
            createBinding: jest.fn().mockReturnValue({

            } as IBinding)
          }
        ],
        initializeForNode: jest.fn()
      }
    ];

    (findNodeByNodeRoute as jest.Mock).mockReturnValue(document.createElement("div"));
  });

  it("should create bindings and initialize nodes", () => {
    const bindings = createBindings(content, contentBindings, bindingNodes);

    expect(bindings).toHaveLength(1);
    expect(bindingNodes[0].bindTexts[0].createBinding).toHaveBeenCalledWith(contentBindings, expect.any(HTMLElement));
    expect(bindingNodes[0].initializeForNode).toHaveBeenCalledWith(expect.any(HTMLElement), bindings);
  });

  it("should handle multiple binding nodes", () => {
    const nodePropertyConstructor = jest.fn().mockReturnValue({} as INodeProperty);
    const statePropertyConstructor = jest.fn().mockReturnValue({} as IStateProperty);
    const nodeProperty: string = "nodeProperty";
    const stateProperty: string = "stateProperty";
    const inputFilters: IFilterText[] = [];
    const outputFilters: IFilterText[] = [];
    bindingNodes.push({
      nodeRoute: [0],
      bindTexts: [
        {
          nodeProperty,
          stateProperty,
          inputFilters,
          outputFilters,
          nodePropertyConstructor,
          statePropertyConstructor,
          createBinding: jest.fn().mockReturnValue({

          } as IBinding)
        },
      ],
      initializeForNode: jest.fn()
    });

    const bindings = createBindings(content, contentBindings, bindingNodes);

    expect(bindings).toHaveLength(2);
    expect(bindingNodes[0].bindTexts[0].createBinding).toHaveBeenCalledWith(contentBindings, expect.any(HTMLElement));
    expect(bindingNodes[1].bindTexts[0].createBinding).toHaveBeenCalledWith(contentBindings, expect.any(HTMLElement));
    expect(bindingNodes[0].initializeForNode).toHaveBeenCalledWith(expect.any(HTMLElement), [bindings[0]]);
    expect(bindingNodes[1].initializeForNode).toHaveBeenCalledWith(expect.any(HTMLElement), [bindings[1]]);
  });

  it("should return an empty array if no binding nodes are provided", () => {
    const bindings = createBindings(content, contentBindings, []);

    expect(bindings).toHaveLength(0);
  });

  it("should raise an error if a node is not found", () => {
    (findNodeByNodeRoute as jest.Mock).mockReturnValue(undefined);

    expect(() => createBindings(content, contentBindings, bindingNodes)).toThrow("Node not found: 0");
  });

});