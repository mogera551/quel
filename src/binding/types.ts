
import { ILoopContext } from "../loopContext/types";
import { IPropInfo } from "../dotNotation/types";
import { IComponent } from "../component/types";
import { IStateProxy } from "../state/types";
import { IFilterManager } from "../filter/types";
import { IUpdator } from "../updator/types";

export interface IPropertyAccess {
  readonly pattern: string;
  readonly indexes: number[];
  readonly propInfo: IPropInfo;
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
  value: any;
  readonly filteredValue: any;
  
  initialize(): void;
  postUpdate(propertyAccessByStatePropertyKey: Map<string,IPropertyAccess>):void;
  equals(value: any): boolean;
  applyToChildNodes(setOfIndex: Set<number>): void;
  dispose(): void;
}

export interface IStateProperty {
  readonly state: IStateProxy;
  readonly name: string;
  readonly binding: IBinding;
  value: any;
  readonly filteredValue: any;
  readonly indexes: number[];
  readonly applicable: boolean;
  readonly key: string;
  readonly propInfo: IPropInfo;
  getChildValue(index:number):any;
  setChildValue(index:number, value:any):void;
  initialize(): void;
  dispose(): void;
}

export interface IBindingBase {
  readonly childrenContentBindings: IContentBindingsBase[];
  readonly parentContentBindings: IContentBindingsBase;
  readonly loopable: boolean;
  readonly statePropertyName: string;
}

export type IComponentPartial = Pick<IComponent, "useKeyed" | "selectorName" | "eventFilterManager" | "inputFilterManager" | "outputFilterManager" | "states" | "bindingSummary" | "updator">;

export interface IBinding extends IBindingBase {
  readonly id: string;
  readonly nodeProperty: INodeProperty;
  readonly stateProperty: IStateProperty;
  readonly childrenContentBindings: IContentBindings[];
  readonly parentContentBindings: IContentBindings;
  readonly component?: IComponentPartial;
  readonly expandable: boolean;
  readonly state?: IStateProxy
  readonly updator?: IUpdator;
  readonly bindingSummary?: IBindingSummary;
  readonly selectorName?: string;
  readonly eventFilterManager: IFilterManager<"event">;
  readonly inputFilterManager: IFilterManager<"input">;
  readonly outputFilterManager: IFilterManager<"output">;
  applyToNode(): void;
  applyToChildNodes(setOfIndex:Set<number>) :void;
  applyToState(): void;
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

export interface IContentBindingsBase {
  readonly childrenBinding: IBindingBase[];
  parentBinding?: IBindingBase;
  readonly loopContext?: ILoopContext;
  readonly currentLoopContext?: ILoopContext;
}

export interface IContentBindings extends IContentBindingsBase {
  readonly template: HTMLTemplateElement;
  readonly childrenBinding: IBinding[];
  parentBinding?: IBinding;
  readonly component?: IComponentPartial;
  readonly parentContentBindings?: IContentBindings;

  readonly fragment: DocumentFragment;
  readonly childNodes: Node[];
  readonly lastChildNode?: Node;

  initialize():void;
  postCreate():void;
//  applyToNode():void;
  removeChildNodes():void;
  dispose():void;

  rebuild(): void;
  //updateNode(): void;
}

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
  flush(): void;
  update(callback:(summary: IBindingSummary)=>any): void;
}
