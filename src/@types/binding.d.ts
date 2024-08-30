
import "../nop";
import { INewLoopContext } from "../loopContext/types";
import { IPropInfo } from "../dotNotation/types";
import { INewComponent, INewUpdator } from "../newComponent/types";
import { IStateProxy } from "../newState/types";
import { FilterFunc } from "./filter";

interface INewPropertyAccess {
  readonly pattern: string;
  readonly indexes: number[];
  readonly propInfo: IPropInfo;
}

interface INewBindingPropertyAccess {
  readonly name: string;
  readonly indexes: number[];
  readonly loopContext?: INewLoopContext;
}

interface INewNodeProperty {
  readonly node: Node;
  readonly name: string;
  readonly binding: INewBinding;
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

interface INewStateProperty {
  readonly state: IStateProxy;
  readonly name: string;
  readonly binding: INewBinding;
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

interface INewBindingBase {
  readonly childrenContentBindings: IContentBindingsBase[];
  readonly parentContentBindings: IContentBindingsBase;
  readonly loopable: boolean;
  readonly statePropertyName: string;
}

type IComponentPartial = Pick<INewComponent, "useKeyed" | "selectorName" | "eventFilterManager" | "inputFilterManager" | "outputFilterManager" | "states" | "bindingSummary" | "updator">;

interface INewBinding extends INewBindingBase {
  readonly id: string;
  readonly nodeProperty: INewNodeProperty;
  readonly stateProperty: INewStateProperty;
  readonly childrenContentBindings: IContentBindings[];
  readonly parentContentBindings: IContentBindings;
  readonly component?: IComponentPartial;
  readonly expandable: boolean;
  readonly state?: IStateProxy
  readonly updator?: INewUpdator;
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
  readonly childrenBinding: INewBindingBase[];
  parentBinding?: INewBindingBase;
  readonly loopContext?: INewLoopContext;
  readonly currentLoopContext?: INewLoopContext;
}

interface IContentBindings extends IContentBindingsBase {
  readonly template: HTMLTemplateElement;
  readonly childrenBinding: INewBinding[];
  parentBinding?: INewBinding;
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
  readonly bindingsByKey: Map<string,INewBinding[]>;
  readonly expandableBindings: Set<INewBinding>;
  readonly componentBindings: Set<INewBinding>;
  readonly allBindings: Set<INewBinding>;
  add(binding: INewBinding): void;
  delete(binding: INewBinding): void;
  exists(binding: INewBinding): boolean;
  flush(): void;
  update(callback:(summary: INewBindingSummary)=>any): void;
}

interface ILoopable {
  readonly revision: number;
}