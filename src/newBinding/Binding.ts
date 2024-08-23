import { INewBinding, INewNodeProperty, INewStateProperty, IContentBindings } from "./types";
import { IComponent } from "../@types/component";
import { NodePropertyCreator, StatePropertyCreator } from "../@types/binder";
import { IFilterInfo } from "../@types/filter";

export class Binding implements INewBinding {
  nodeProperty: INewNodeProperty;
  stateProeprty: INewStateProperty;
  childrenContentBindings: IContentBindings[] = [];
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