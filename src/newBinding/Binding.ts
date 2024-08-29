import { INewBinding, INewNodeProperty, INewStateProperty, IContentBindings, INewBindingSummary, IComponentPartial } from "./types";
import { NodePropertyCreator, StatePropertyCreator } from "../newBinder/types";
import { IFilterInfo, IFilterManager } from "../@types/filter";
import { utils } from "../utils";
import { INewUpdator } from "../newComponent/types";
import { IStateProxy } from "../newState/types";

let id = 1;
class Binding implements INewBinding {
  #id:number;
  #nodeProperty: INewNodeProperty;
  #stateProperty: INewStateProperty;
  // ToDo: このプロパティはchildrenとしたほうがいいのか？
  childrenContentBindings: IContentBindings[] = [];
  // ToDo: このプロパティはparentとしたほうがいいのか？
  #parentContentBindings: IContentBindings;

  get id(): string {
    return this.#id.toString();
  }

  // todo: このgetterを使うか検討
  get nodeProperty(): INewNodeProperty {
    return this.#nodeProperty;
  }
  // todo: このgetterを使うか検討
  get stateProperty(): INewStateProperty {
    return this.#stateProperty;
  }
  get statePropertyName(): string {
    return this.#stateProperty.name;
  }
  get parentContentBindings(): IContentBindings {
    return this.#parentContentBindings;
  }
  get loopable(): boolean {
    return this.#nodeProperty.loopable;
  }
  get expandable(): boolean {
    return this.#nodeProperty.expandable;
  }
  get component(): IComponentPartial {
    return this.#parentContentBindings.component;
  }
  get updator(): INewUpdator {
    return this.component.updator;
  }
  get bindingSummary(): INewBindingSummary {
    return this.component.bindingSummary;
  }
  get state(): IStateProxy {
    return this.component.states.current;
  }
  get selectorName(): string {
    return this.component.selectorName;
  }
  get eventFilterManager(): IFilterManager<"event"> {
    return this.component.eventFilterManager;
  }
  get inputFilterManager(): IFilterManager<"input"> {
    return this.component.inputFilterManager;
  }
  get outputFilterManager(): IFilterManager<"output"> {
    return this.component.outputFilterManager;
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

  applyToNode() {
    const { updator, nodeProperty, stateProperty } = this
    updator.applyNodeUpdatesByBinding(this, () => {
      if (!nodeProperty.applicable) return;
      const filteredStateValue = stateProperty.filteredValue ?? "";
      if (nodeProperty.equals(filteredStateValue)) return;
      nodeProperty.value = filteredStateValue;
    });
  }

  applyToChildNodes(setOfIndex:Set<number>) {
    const { updator } = this;
    updator.applyNodeUpdatesByBinding(this, () => {
      this.nodeProperty.applyToChildNodes(setOfIndex);
    });
  }

  applyToState() {
    const { stateProperty, nodeProperty } = this;
    if (!stateProperty.applicable) return;
    stateProperty.value = nodeProperty.filteredValue;
  }

  /**
   */
  execDefaultEventHandler(event:Event) {
    if (!(this.bindingSummary.exists(this) ?? false)) return;
    event.stopPropagation();
    this.updator.addProcess(this.applyToState, this, []);
  }

  #defaultEventHandler:(((event:Event)=>void)|undefined) = undefined;
  get defaultEventHandler():((event:Event)=>void) {
    if (typeof this.#defaultEventHandler === "undefined") {
      this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
    }
    return this.#defaultEventHandler;
  }

  initialize() {
    this.nodeProperty.initialize();
    this.stateProperty.initialize();
  }

  appendChildContentBindings(contentBindings: IContentBindings): void {
    if (!this.expandable) utils.raise("Binding.appendChild: not expandable");
    this.childrenContentBindings.push(contentBindings);
    // DOM
    const lastChildContentBindings = this.childrenContentBindings[this.childrenContentBindings.length - 1];
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChildContentBindings?.lastChildNode ?? this.nodeProperty.node;
    parentNode?.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
  }

  replaceChildContentBindings(contentBindings: IContentBindings, index: number): void {
    if (!this.expandable) utils.raise("Binding.replaceChild: not expandable");
    this.childrenContentBindings[index] = contentBindings;
    // DOM
    const lastChildContentBindings = this.childrenContentBindings[index - 1];
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChildContentBindings?.lastChildNode ?? this.nodeProperty.node;
    parentNode?.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
  }

  removeAllChildrenContentBindings(): IContentBindings[] {
    const removedContentBindings = this.childrenContentBindings;
    this.childrenContentBindings = [];
    for(let i = 0; i < removedContentBindings.length; i++) {
      removedContentBindings[i].dispose();
    }
    return removedContentBindings;
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
  const binding = new Binding(contentBindings, node, nodePropertyName, nodePropertyCreator, outputFilters, statePropertyName, statePropertyCreator, inputFilters);
  binding.initialize();
  return binding;
}