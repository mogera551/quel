
import "../nop";
import { ILoopContext } from "./loopContext";
import { IPropInfo } from "./dotNotation";
import { INewComponent, IUpdator } from "../newComponent/types";
import { IStateProxy } from "../newState/types";
import { FilterFunc } from "./filter";

interface INewPropertyAccess {
  readonly pattern: string;
  readonly indexes: number[];
  readonly propInfo: IPropInfo;
}

interface IBindingPropertyAccess {
  readonly name: string;
  readonly indexes: number[];
  readonly loopContext?: ILoopContext;
}

interface INodeProperty {
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
  postUpdate(propertyAccessByStatePropertyKey:Map<string,INewPropertyAccess>):void;
  equals(value:any): boolean;
  applyToChildNodes(setOfIndex:Set<number>);
  dispose(): void;
}

interface IStateProperty {
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
}

interface IBindingBase {
  readonly childrenContentBindings: IContentBindingsBase[];
  readonly parentContentBindings: IContentBindingsBase;
  readonly loopable: boolean;
  readonly statePropertyName: string;
}

type IComponentPartial = Pick<INewComponent, "useKeyed" | "selectorName" | "eventFilterManager" | "inputFilterManager" | "outputFilterManager" | "states" | "bindingSummary" | "updator">;

interface IBinding extends IBindingBase {
  readonly id: string;
  readonly nodeProperty: INodeProperty;
  readonly stateProperty: IStateProperty;
  readonly childrenContentBindings: IContentBindings[];
  readonly parentContentBindings: IContentBindings;
  readonly component?: IComponentPartial;
  readonly expandable: boolean;
  readonly state?: IStateProxy
  readonly updator?: IUpdator;
  readonly bindingSummary?: INewBindingSummary;
  readonly selectorName?: string;
  readonly eventFilterManager?: IFilterManager<"event">;
  readonly inputFilterManager?: IFilterManager<"input">;
  readonly outputFilterManager?: IFilterManager<"output">;
  applyToNode();
  applyToChildNodes(setOfIndex:Set<number>);
  applyToState();
  defaultEventHandler: (event:Event)=>void;
  execDefaultEventHandler(event:Event);
  initialize();
  appendChildContentBindings(contentBindings: IContentBindings): void;
  replaceChildContentBindings(contentBindings: IContentBindings, index: number): void;
  removeAllChildrenContentBindings(): IContentBindings[];
  dispose(): void;
}

interface IContentBindingsBase {
  readonly childrenBinding: IBindingBase[];
  parentBinding?: IBindingBase;
  readonly loopContext?: ILoopContext;
  readonly currentLoopContext?: ILoopContext;
}

interface IContentBindings extends IContentBindingsBase {
  readonly template: HTMLTemplateElement;
  readonly childrenBinding: IBinding[];
  parentBinding?: IBinding;
  readonly component?: IComponent;
  readonly parentContentBindings?: IContentBindings;

  readonly fragment: DocumentFragment;
  readonly childNodes: Node[];
  readonly lastChildNode?: Node;

  initialize():void;
  postCreate():void;
  applyToNode():void;
  removeChildNodes():void;
  dispose():void;
}

interface IMultiValue {
  value:any;
  enabled:boolean;
}

interface INewBindingSummary {
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
  update(callback:(summary: INewBindingSummary)=>any): void;
}

interface ILoopable {
  readonly revision: number;
}