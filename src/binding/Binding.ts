import { IBinding, INodeProperty, IStateProperty, IContentBindings, IComponentPartial, INewBindingSummary } from "./types";
import { NodePropertyConstructor, StatePropertyConstructor } from "../binder/types";
import { IFilterText, IFilterManager } from "../filter/types";
import { utils } from "../utils";
import { IUpdater } from "../updater/types";
import { IStateProxy } from "../state/types";
import { setValueToState } from "./setValueToState";
import { setValueToNode } from "./setValueToNode";

let id = 1;
class Binding implements IBinding {
  #id:number;
  #nodeProperty: INodeProperty;
  #stateProperty: IStateProperty;
  // ToDo: このプロパティはchildrenとしたほうがいいのか？
  childrenContentBindings: IContentBindings[] = [];
  // ToDo: このプロパティはparentとしたほうがいいのか？
  #parentContentBindings: IContentBindings;

  get id(): string {
    return this.#id.toString();
  }

  // todo: このgetterを使うか検討
  get nodeProperty(): INodeProperty {
    return this.#nodeProperty;
  }
  // todo: このgetterを使うか検討
  get stateProperty(): IStateProperty {
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
  get component(): IComponentPartial | undefined {
    return this.#parentContentBindings.component;
  }
  get updater(): IUpdater | undefined {
    return this.component?.quelUpdater;
  }
  get quelBindingSummary(): INewBindingSummary | undefined {
    return this.component?.quelBindingSummary;
  }
  get state(): IStateProxy | undefined {
    return this.component?.quelState;
  }
  get selectorName(): string | undefined{
    return this.component?.quelSelectorName;
  }
  get eventFilterManager(): IFilterManager<"event"> {
    return this.component?.quelEventFilterManager ?? utils.raise("Binding.eventFilterManager: undefined");
  }
  get inputFilterManager(): IFilterManager<"input"> {
    return this.component?.quelInputFilterManager ?? utils.raise("Binding.inputFilterManager: undefined");
  }
  get outputFilterManager(): IFilterManager<"output"> {
    return this.component?.quelOutputFilterManager ?? utils.raise("Binding.outputFilterManager: undefined");
  }

  constructor(
    contentBindings: IContentBindings,
    node: Node, 
    nodePropertyName: string, 
    nodePropertyConstructor: NodePropertyConstructor, 
    outputFilters: IFilterText[],
    statePropertyName: string, 
    statePropertyConstructor: StatePropertyConstructor,
    inputFilters: IFilterText[]
  ) {
    this.#id = ++id;
    this.#parentContentBindings = contentBindings;
    this.#nodeProperty = nodePropertyConstructor(this, node, nodePropertyName, outputFilters);
    this.#stateProperty = statePropertyConstructor(this, statePropertyName, inputFilters);
  }

  /**
   */
  execDefaultEventHandler(event:Event) {
    if (!(this.quelBindingSummary?.exists(this) ?? false)) return;
    event.stopPropagation();
    const { nodeProperty, stateProperty } = this;
    this.updater?.addProcess(setValueToState, undefined, [ nodeProperty, stateProperty ], this.parentContentBindings?.currentLoopContext);
  }

  #defaultEventHandler:(((event:Event)=>void)|undefined) = undefined;
  get defaultEventHandler():((event:Event)=>void) {
    if (typeof this.#defaultEventHandler === "undefined") {
      this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
    }
    return this.#defaultEventHandler;
  }
  set defaultEventHandler(value:((event:Event)=>void)) {
    this.#defaultEventHandler = value;
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
    this.quelBindingSummary?.delete(this);
    this.nodeProperty.dispose();
    this.stateProperty.dispose();
    this.childrenContentBindings.forEach(contentBindings => contentBindings.dispose());
    this.childrenContentBindings = [];
  }

  rebuild(): void {
    const { updater, nodeProperty, stateProperty } = this;
    setValueToNode(this, updater, nodeProperty, stateProperty);
  }

  updateNodeForNoRecursive(): void {
    // rebuildで再帰的にupdateするnodeが決まるため
    // 再帰的に呼び出す必要はない
    if (!this.expandable) {
      const { updater, nodeProperty, stateProperty } = this;
      setValueToNode(this, updater, nodeProperty, stateProperty);
    }
  }

}

export function createBinding(
  contentBindings: IContentBindings,
  node: Node, 
  nodePropertyName: string, 
  nodePropertyConstructor: NodePropertyConstructor, 
  outputFilters: IFilterText[],
  statePropertyName: string, 
  statePropertyConstructor: StatePropertyConstructor,
  inputFilters: IFilterText[]
): IBinding {
  const binding = new Binding(contentBindings, node, nodePropertyName, nodePropertyConstructor, outputFilters, statePropertyName, statePropertyConstructor, inputFilters);
  binding.initialize();
  return binding;
}