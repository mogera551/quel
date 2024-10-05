
import { ILoopContext } from "../loopContext/types";
import { CleanIndexes, Indexes, IPropInfo } from "../dotNotation/types";
import { IComponent } from "../component/types";
import { IStateProxy } from "../state/types";
import { IFilterManager } from "../filter/types";
import { IUpdator } from "../updator/types";

export interface IPropertyAccess {
  readonly pattern: string;
  readonly indexes: number[];
  readonly propInfo: IPropInfo;
  readonly key: string;
}

export interface IBindingPropertyAccess {
  readonly name: string;
  readonly indexes: number[];
  readonly loopContext?: ILoopContext;
}

export interface ILoopable {
  readonly revisionForLoop: number;
  revisionUpForLoop(): number;
}

export interface INodeProperty extends ILoopable {
  readonly node: Node;
  readonly name: string;
  readonly binding: IBinding;
  readonly applicable: boolean;
  readonly expandable: boolean;
  readonly isSelectValue: boolean;
  readonly loopable: boolean;
  initialize(): void;
  postUpdate(propertyAccessByStatePropertyKey: Map<string,IPropertyAccess>):void;
  equals(value: any): boolean;
  applyToChildNodes(setOfIndex: Set<number>, indexes?: CleanIndexes): void;
  dispose(): void;
  getValue(): any;
  getFilteredValue(): any;
  setValue(value: any): void;
}

export interface IStateProperty {
  readonly state: IStateProxy;
  readonly name: string;
  readonly binding: IBinding;
  readonly indexes: number[];
  readonly applicable: boolean;
  readonly key: string;
  readonly propInfo: IPropInfo;
  readonly level: number;
  readonly lastWildCard: string;
  getChildValue(index:number):any;
  setChildValue(index:number, value:any):void;
  initialize(): void;
  dispose(): void;
  getValue(): any;
  getFilteredValue(): any;
  setValue(value: any): void;
}

export type IComponentPartial = Pick<IComponent, "useKeyed" | "selectorName" | "eventFilterManager" | "inputFilterManager" | "outputFilterManager" | "states" | "newBindingSummary" | "updator">;

export interface IBindingTreeNode {
  readonly childrenContentBindings: IContentBindingsTreeNode[];
  readonly parentContentBindings: IContentBindingsTreeNode;
  readonly loopable: boolean;
  readonly statePropertyName: string;
}

export interface IBinding extends IBindingTreeNode {
  readonly id: string;
  readonly nodeProperty: INodeProperty;
  readonly stateProperty: IStateProperty;
  readonly childrenContentBindings: IContentBindings[];
  readonly parentContentBindings: IContentBindings;
  readonly component?: IComponentPartial;
  readonly expandable: boolean;
  readonly state?: IStateProxy
  readonly updator?: IUpdator;
  readonly selectorName?: string;
  readonly eventFilterManager: IFilterManager<"event">;
  readonly inputFilterManager: IFilterManager<"input">;
  readonly outputFilterManager: IFilterManager<"output">;
  readonly newBindingSummary?: INewBindingSummary;
  defaultEventHandler: (event:Event)=>void;
  execDefaultEventHandler(event:Event): void;
  initialize(): void;
  appendChildContentBindings(contentBindings: IContentBindings): void;
  replaceChildContentBindings(contentBindings: IContentBindings, index: number): void;
  removeAllChildrenContentBindings(): IContentBindings[];
  dispose(): void;

  rebuild(): void;
  updateNodeForNoRecursive(): void;
}

export interface IContentBindingsTreeNode {
  readonly childBindings: IBindingTreeNode[];
  parentBinding?: IBindingTreeNode;
  readonly loopContext?: ILoopContext;
  readonly currentLoopContext?: ILoopContext;
}

export interface IContentBindings extends IContentBindingsTreeNode {
  readonly template: HTMLTemplateElement;
  readonly childBindings: IBinding[];
  parentBinding?: IBinding;
  component?: IComponentPartial;
  readonly parentContentBindings?: IContentBindings;

  readonly fragment: DocumentFragment;
  readonly childNodes: Node[];
  readonly lastChildNode?: Node;
  readonly allChildBindings: IBinding[];
  readonly loopable: boolean;
  readonly useKeyed: boolean;
  readonly patternName: string;
  readonly localTreeNodes: Set<IBinding>;

//  initialize():void;
  removeChildNodes():void;
  dispose():void;

  rebuild(indexes?: CleanIndexes | undefined): void;
  registerBindingsToSummary(): void;
}

export type IContentBindingTreeNode = Pick<IContentBindings, "childBindings" | "parentBinding" | "loopContext" | "currentLoopContext">

export interface IMultiValue {
  value:any;
  enabled:boolean;
}

export interface IBindingSummary {
  updated: boolean;
  readonly updateRevision: number;
  readonly bindingsByKey: Map<string,IBinding[]>;
  readonly expandableBindings: Set<IBinding>;
  readonly componentBindings: Set<IBinding>;
  readonly allBindings: Set<IBinding>;
  add(binding: IBinding): void;
  delete(binding: IBinding): void;
  exists(binding: IBinding): boolean;
  update(callback:(summary: IBindingSummary)=>any): void;
  partialUpdate(bindings: IBinding[]): void;
}

export interface INewBindingSummary {
  register(binding: IBinding): void;
  delete(binding: IBinding): void;
  gatherBindings(pattern: string, indexes: number[]): IBinding[];
  exists(binding: IBinding): boolean;
}
