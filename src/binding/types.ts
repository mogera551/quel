import { ILoopContext, ILoopIndexes } from "../loopContext/types";
import { IPropInfo } from "../propertyInfo/types";
import { IComponent } from "../component/types";
import { IStatePropertyAccessor, IStateProxy } from "../state/types";
import { IFilterManager } from "../filter/types";
import { IUpdater } from "../updater/types";

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
  postUpdate(propertyAccessByStatePropertyKey: Map<string,IStatePropertyAccessor>):void;
  equals(value: any): boolean;
  applyToChildNodes(setOfIndex: Set<number>): void;
  dispose(): void;
  getValue(): any;
  getFilteredValue(): any;
  setValue(value: any): void;
}

export interface IStateProperty {
  readonly state: IStateProxy;
  readonly name: string;
  readonly binding: IBinding;
  readonly loopIndexes: ILoopIndexes | undefined
  readonly applicable: boolean;
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

export type IComponentPartial = HTMLElement & Pick<IComponent, 
  "quelUseKeyed" | "quelUseInvokeCommands" | "quelSelectorName" | "quelEventFilterManager" | "quelInputFilterManager" | "quelOutputFilterManager" |
  "quelState" | "quelBindingSummary" | "quelUpdater" | "quelPopoverInfo" | "quelIsQuelComponent">;

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
  readonly updater?: IUpdater;
  readonly selectorName?: string;
  readonly eventFilterManager: IFilterManager<"event">;
  readonly inputFilterManager: IFilterManager<"input">;
  readonly outputFilterManager: IFilterManager<"output">;
  readonly quelBindingSummary?: INewBindingSummary;
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
  readonly patternName: string;
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
  readonly localTreeNodes: Set<IBinding>;

//  initialize():void;
  removeChildNodes():void;
  dispose():void;

  rebuild(): void;
  registerBindingsToSummary(): void;
}

export type IContentBindingTreeNode = Pick<IContentBindings, "childBindings" | "parentBinding" | "loopContext" | "currentLoopContext">

export interface IMultiValue {
  value:any;
  enabled:boolean;
}

export interface INewBindingSummary {
  readonly allBindings: Set<IBinding>;
  register(binding: IBinding): void;
  delete(binding: IBinding): void;
  gatherBindings(propertyAccessor: IStatePropertyAccessor): IBinding[];
  exists(binding: IBinding): boolean;
}
