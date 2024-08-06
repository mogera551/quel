import { IPatternNameInfo, IPropertyNameInfo } from "../dot-notation/types";
import { FilterFunc, IFilterInfo } from "../filter/types";
import { ILoopContext } from "../loopContext/types";
import { NodePropertyCreator, StatePropertyCreator } from "../newBinder/types";

export interface INodeProperty {
  node: Node;
  name: string;
  nameElements: string[];
  value: any;
  filters: FilterFunc[];
  filteredValue: any;
  applicable: boolean;
  binding: IBinding;
  expandable: boolean;
  isSelectValue: boolean;
  loopable: boolean;
  assign(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]):INodeProperty;
  initialize():void;
  postUpdate(propertyAccessByViewModelPropertyKey:Map<string,{name:string,indexes:number[]}>):void;
  isSameValue(value:any):boolean;
  applyToChildNodes(indexes:Set<number>):void;
  dispose():void;
}

export interface IStateProperty {
  state: State;
  name: string;
  propertyName: IPropertyNameInfo;
  patternName: IPatternNameInfo;
  level: number;
  indexes: number[];
  indexesString: string;
  key: string;
  oldKey: string;
  isChagedKey: boolean;
  getKey():string;
  value: any;
  filters:FilterFunc[];
  filteredValue: any;
  applicable: boolean;
  binding: IBinding;
  assign(binding:IBinding, name:string, filters:IFilterInfo[]):IStateProperty;
  initialize():void;
  getChildValue(index:number):any;
  setChildValue(index:number, value:any):boolean;
  dispose():void;

}

export interface IBinding {
  id: number;
  bindingManager: IBindingManager;
  nodeProperty: INodeProperty;
  stateProperty: IStateProperty;
  component: any;
  loopContext: any;
  children: IBindingManager[];
  expandable: boolean;
  loopable: boolean;
  isSelectValue: boolean;
  assign(bindingManager:IBindingManager, 
    node:Node, nodePropertyName:string, nodePropertyCreator: NodePropertyCreator, 
    statePropertyName:string, statePropertyCreator:StatePropertyCreator, filters:IFilterInfo[]): IBinding;
  applyToNode():void;
  applyToChildNodes(setOfIndex:Set<number>):void;
  applyToState():void;
  execDefaultEventHandler(event:Event):void;
  defaultEventHandler:(event:Event)=>void;
  initialize():void;
  appendChild(binding:IBindingManager):void;
  replaceChild(index:number, binding:IBindingManager):void;
  dispose():void;

}

export interface IBindingManager {
  component: any;
  bindings: IBinding[];
  nodes: Node[];
  elements: Element[];
  lastNode: Node;
  fragment: DocumentFragment;
  loopContext: ILoopContext;
  template: HTMLTemplateElement;
  parentBinding: IBinding|undefined;
  uuid: string;
  assign(component:any, template:HTMLTemplateElement, uuid:string, parentBinding:IBinding|undefined):IBindingManager;
  initialize():void;
  registerBindingsToSummary():void;
  postCreate():void;
  applyToNode():void;
  applyToState():void;
  removeNodes():void;
  dispose():void;

}