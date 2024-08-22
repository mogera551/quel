import { IBinding, INodeProperty, IStateProperty, IContentBindings } from "./types";
import { IComponent } from "../@types/component";
import { NodePropertyCreator, StatePropertyCreator } from "../@types/binder";
import { IFilterInfo } from "../@types/filter";

export class Binding implements IBinding {
  nodeProperty: INodeProperty;
  stateProeprty: IStateProperty;
  listContentBindings: IContentBindings[];
  #parentContentBindings: IContentBindings;
  get parentContentBindings(): IContentBindings {
    return this.#parentContentBindings;
  }
  loopable: boolean;
  get component(): IComponent {
  }

  constructor(
    contentBindings: IContentBindings,
    node: Node, 
    nodePropertyName: string, 
    nodePropertyCreator: NodePropertyCreator, 
    outputFilters: IFilterInfo[],
    statePropertyName: string, 
    statePropertyCreator: StatePropertyCreator,
    inputFilters: IFilterInfo[]
  ) {
    // assignを呼ぶとbindingManagerなどがundefinedになるので、constructorで初期化
    this.#id = ++seq;
    this.#parentContentBindings = contentBindings;
    this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, outputFilters);
    this.#stateProperty = statePropertyCreator(this, statePropertyName, inputFilters);
  }
}