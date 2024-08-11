import { IComponent } from "./component";
import { IPatternNameInfo, IPropertyNameInfo } from "./dotNotation";
import { FilterFunc, IFilterInfo } from "./filter";
import { ILoopContext } from "./loopContext";
import { NodePropertyCreator, StatePropertyCreator } from "./binder";
import { IState } from "./state";

interface INodeProperty {
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
  postUpdate(propertyAccessByViewModelPropertyKey:Map<string,IPropertyAccess>):void;
  isSameValue(value:any):boolean;
  applyToChildNodes(indexes:Set<number>):void;
  dispose():void;
}

interface IStateProperty {
  state: IState;
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

interface IBinding {
  id: number;
  bindingManager: IBindingManager;
  nodeProperty: INodeProperty;
  stateProperty: IStateProperty;
  component: IComponent;
  loopContext: ILoopContext;
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

interface IBindingManager {
  component: IComponent;
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

interface IBindingSummary {
  get updated(): boolean;
  set updated(value: boolean);
  get updateRevision(): number;
  get bindingsByKey(): Map<string,IBinding[]>;
  get expandableBindings(): Set<IBinding>;
  get componentBindings(): Set<IBinding>;
  get allBindings(): Set<IBinding>;
  add(binding:IBinding):void;
  delete(binding:IBinding):void;
  exists(binding:IBinding):boolean;
  flush():void;
  update(callback:(summary:IBindingSummary)=>any):void;
}

interface IPropertyAccess {
  patternName: string;
  indexes: number[];
  get patternNameInfo():IPatternNameInfo;
}

interface IMultiValue {
  value:any;
  enabled:boolean;
}

interface IBindingPropertyAccess {
  get name():string;
  get indexes():number[];
  get loopContext():ILoopContext;
}
