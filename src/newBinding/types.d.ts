
import "../nop";
import { INewLoopContext } from "../newLoopContext/types";
import { IPropInfo } from "../newDotNotation/types";

export interface INewPropertyAccess {
  readonly pattern: string;
  readonly indexes: number[];
  readonly propInfo: IPropInfo;
}

export interface INewBindingPropertyAccess {
  readonly name: string;
  readonly indexes: number[];
  readonly loopContext?: INewLoopContext;
}

export interface INewNodeProperty {
  readonly node: Node;
  readonly name: string;
  readonly binding: INewBinding;
  readonly applicable: boolean;
  readonly expandable: boolean;
  readonly isSelectValue: boolean;
  readonly loopable: boolean;
  value: any;
  readonly filteredValue: any;
  postUpdate(propertyAccessByStatePropertyKey:Map<string,INewPropertyAccess>):void;
}

export interface INewStateProperty {
  readonly state: IState;
  readonly name: string;
  readonly binding: INewBinding;
  value: any;
  readonly filteredValue: any;
  readonly indexes: number[];
  getChildValue(index:number):any;
  setChildValue(index:number, value:any):void;
}

export interface INewBindingBase {
  readonly childrenContentBindings: IContentBindingsBase[];
  readonly parentContentBindings: IContentBindingsBase;
  readonly loopable: boolean;
  readonly statePropertyName: string;
}

export interface INewBinding extends INewBindingBase {
  readonly id: string;
  readonly nodeProperty: INewNodeProperty;
  readonly stateProperty: INewStateProperty;
  readonly childrenContentBindings: IContentBindings[];
  readonly parentContentBindings: IContentBindings;
  readonly component: IComponent;
  appendChildContentBindings(contentBindings: IContentBindings): void;
  replaceChildContentBindings(contentBindings: IContentBindings, index: number): void;
  removeAllChildrenContentBindings(): IContentBindings[];
  dispose(): void;
}

export interface IContentBindingsBase {
  readonly childrenBinding: INewBindingBase[];
  parentBinding?: INewBindingBase;
  readonly loopContext?: INewLoopContext;
  readonly currentLoopContext?: INewLoopContext;
}

export interface IContentBindings extends IContentBindingsBase {
  readonly template: HTMLTemplateElement;
  readonly childrenBinding: INewBinding[];
  parentBinding?: INewBinding;
  readonly component: IComponent;
  readonly parentContentBindings?: IContentBindings;

  readonly fragment: DocumentFragment;
  readonly childNodes: Node[];
  readonly lastChildNode?: Node;

  initialize():void;
  applyToNode():void;
  removeChildNodes():void;
  dispose():void;
}

type IContentBindings = IContentBindingsHierarchy & IContentBindingsPartial;

export interface IMultiValue {
  value:any;
  enabled:boolean;
}
