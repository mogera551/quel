import { INewBinding, INewNodeProperty, INewStateProperty, IContentBindings } from "./types";
import { IComponent } from "../@types/component";
import { NodePropertyCreator, StatePropertyCreator } from "../newBinder/types";
import { IFilterInfo } from "../@types/filter";

let id = 1;
class Binding implements INewBinding {
  #id:number;
  #nodeProperty: INewNodeProperty;
  #stateProperty: INewStateProperty;
  childrenContentBindings: IContentBindings[] = [];
  #parentContentBindings: IContentBindings;

  get id(): string {
    return this.#id.toString();
  }

  // todo: このgetterを使うか検討
  get nodeProperty(): INewNodeProperty {
    return this.#nodeProperty;
  }
  // todo: このgetterを使うか検討
  get stateProeprty(): INewStateProperty {
    return this.#stateProperty;
  }
  get parentContentBindings(): IContentBindings {
    return this.#parentContentBindings;
  }
  get loopable(): boolean {
    return false;
  }
  get component(): IComponent {
    return this.#parentContentBindings.component;
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
    this.#id = ++id;
    this.#parentContentBindings = contentBindings;
    this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, outputFilters);
    this.#stateProperty = statePropertyCreator(this, statePropertyName, inputFilters);
  }

  appendChildContentBindings(contentBindings: IContentBindings): void {
    this.childrenContentBindings.push(contentBindings);
  }

  removeAllChildrenContentBindings(): IContentBindings[] {
    const removed = this.childrenContentBindings;
    this.childrenContentBindings = [];
    return removed;
  }

  applyToNode(): void {
  }

  dispose(): void {
    this.childrenContentBindings.forEach(contentBindings => contentBindings.dispose());
    this.childrenContentBindings = [];
  }
}

export function createBinding(
  contentBindings: IContentBindings,
  node: Node, 
  nodePropertyName: string, 
  nodePropertyCreator: NodePropertyCreator, 
  outputFilters: IFilterInfo[],
  statePropertyName: string, 
  statePropertyCreator: StatePropertyCreator,
  inputFilters: IFilterInfo[]
): INewBinding {
  return new Binding(contentBindings, node, nodePropertyName, nodePropertyCreator, outputFilters, statePropertyName, statePropertyCreator, inputFilters);
}