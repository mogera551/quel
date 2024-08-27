import "../nop";

import { BindPropertySymbol, ClearBufferSymbol, ClearSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component";
import { IBinding, IBindingManager, IBindingSummary, IPropertyAccess } from "./binding";
import { EventFilterFuncWithOption, FilterFuncWithOption, FilterType, IFilterManager } from "./filter";
import { IGlobalData } from "./global";
import { IState, Proxies, StateClass } from "./state";

export type NewComponentModuleConfig = {
  readonly extends?: string; // for customized built-in element, like extends="button"
  readonly debug?: boolean; // debug mode for the component, default is false
  readonly useShadowRoot?: boolean; // attach shadow root to the component, default is false
  readonly useKeyed?: boolean; // use keyed, default is true. keyed is used for the component instance.
  readonly useWebComponent?: boolean; // use web component, default is true. if false then no use custom element.
  readonly useLocalTagName?: boolean; // use local tag name, default is true. local custom tag is unique in the document.
  readonly useLocalSelector?: boolean; // use local selector, default is true. local selector is unique in the document.
  readonly useOverscrollBehavior?: boolean; // use overscroll-behavior, default is true. overscroll-behavior is used for the component instance.
}

export type NewComponentModuleOptions = {
  readonly extends?: string; // for customized built-in element, like extends="button"
}

export type NewComponentModuleFilters = {
  readonly input?: {[key: string]: FilterFuncWithOption};
  readonly output?: {[key: string]: FilterFuncWithOption};
  readonly event?: {[key: string]: EventFilterFuncWithOption};
}

export type NewComponentModule = {
  readonly html?: string;
  readonly css?: string;
  readonly State?:typeof Object;
  readonly componentModules?:{[key:string]:NewComponentModule};
  readonly config?: NewComponentModuleConfig;
  readonly options?: NewComponentModuleOptions;
  readonly filters?: NewComponentModuleFilters;
  readonly moduleConfig?: NewComponentModuleConfig;
}

export interface INewModule {
  readonly uuid: string;
  readonly html: string;
  readonly css?: string;
  readonly template: HTMLTemplateElement;
  readonly styleSheet?: CSSStyleSheet;
  readonly State: typeof Object;
  readonly config: NewComponentModuleConfig;
  readonly moduleConfig: NewComponentModuleConfig;
  readonly options: NewComponentModuleOptions;
  readonly filters: NewComponentModuleFilters;
  readonly componentModules?: {[key: string]: INewModule};
  readonly componentModulesForRegister?: {[key: string]: INewModule};
}

export type NewCustomElementInfo = {
  readonly lowerTagName: string; // lower case tag name
  readonly selectorName: string; // local selector name
  readonly isAutonomousCustomElement: boolean; // is autonomous custom element
  readonly isCostomizedBuiltInElement: boolean; // is customized built-in element
}

export type NewFilterManagers = {
  readonly inputFilterManager: IFilterManager<"input">, 
  readonly outputFilterManager: IFilterManager<"output">, 
  readonly eventFilterManager: IFilterManager<"event">
};

export interface INewComponentBase {
  readonly module: INewModule;
  readonly isQuelComponent: boolean;
  readonly customElementInfo: NewCustomElementInfo;
  readonly template: HTMLTemplateElement;
  readonly styleSheet?: CSSStyleSheet;
  readonly State: StateClass;
  readonly inputFilters: {[key: string]: FilterFuncWithOption};
  readonly outputFilters: {[key: string]: FilterFuncWithOption};
  readonly eventFilters: {[key: string]: EventFilterFuncWithOption};
  readonly useShadowRoot: boolean;
  readonly useWebComponent: boolean;
  readonly useLocalTagName: boolean;
  readonly useKeyed: boolean;
  readonly useLocalSelector: boolean;
  readonly useOverscrollBehavior: boolean;
  readonly lowerTagName: string;
  readonly selectorName: string;
  // is autonomous custom element 
  readonly isAutonomousCustomElement: boolean;
  // is costomized built-in element
  readonly isCostomizedBuiltInElement: boolean;
  readonly filterManagers: NewFilterManagers;
  readonly inputFilterManager: IFilterManager<"input">;
  readonly outputFilterManager: IFilterManager<"output">;
  readonly eventFilterManager: IFilterManager<"event">;
  readonly baseClass: Function;
  readonly thisClass: Function;
}

export interface INewCustomComponent {
  states:Proxies;
  get component():IComponent & HTMLElement;
  get parentComponent():IComponent & HTMLElement;
  get initialPromises():PromiseWithResolvers<void>;
  get alivePromises():PromiseWithResolvers<void>;
  set alivePromises(promises:PromiseWithResolvers<void>);
  get baseState():Object;
  get writableState():IState;
  get readonlyState():IState;
  get currentState():IState;
  get rootBindingManager():IBindingManager;
  set rootBindingManager(bindingManager:IBindingManager);
  get viewRootElement():ShadowRoot|HTMLElement;
  get queryRoot():ShadowRoot|HTMLElement;
  get pseudoParentNode():Node;
  set pseudoParentNode(node:Node);
  get pseudoNode():Node;
  set pseudoNode(node:Node);
  get isWritable():boolean;
  stateWritable(callback:()=>Promise<void>):Promise<void>;
  get shadowRootOrDocument():ShadowRoot|Document;
  get contextRevision():number;
  set contextRevision(revision:number);
  useContextRevision(callback:(revision:number)=>void):void;
  get bindingSummary():IBindingSummary;
  get updator():IUpdator;
  get props():IProps;
  get globals():IGlobalData;

  build():Promise<void>;

  connectedCallback():Promise<void>;
  disconnectedCallback():Promise<void>;
} 

export interface IDialogComponent {
  get dialogPromises():PromiseWithResolvers<any>|undefined;
  set dialogPromises(promises:PromiseWithResolvers<any>|undefined);
  get returnValue():string;
  set returnValue(value:string);
  get useBufferedBind():boolean;
  asyncShowModal(props:{[key:string]:any}):Promise<any>;
  asyncShow(props:{[key:string]:any}):Promise<any>;
  showModal():void;
  show():void;
  close(result:any):void;
}

export interface IPopoverComponent {
  get canceled():boolean;
  set canceled(value:boolean);
  get popoverPromises():PromiseWithResolvers<any>|undefined;
  set popoverPromises(promises:PromiseWithResolvers<any>|undefined);
  get popoverContextIndexesById():Map<string,number[]>;
  asyncShowPopover(props:{[key:string]:any}):Promise<any>;
  hidePopover():void;
  cancelPopover():void;
}
export type Constructor<T = {}> = new (...args: any[]) => T;

export type IComponent = IComponentBase & ICustomComponent & IDialogComponent & IPopoverComponent & HTMLElement;

export interface IProcess {
  target:Function;
  thisArgument:object;
  argumentList:any[];
}

export interface IUpdator {
  component:IComponent;
  processQueue:IProcess[];
  updatedStateProperties:IPropertyAccess[];
  expandedStateProperties:IPropertyAccess[];
  updatedBindings:Set<IBinding>;

  executing:boolean;

  addProcess(target:Function, thisArgument:object, argumentList:any[]):void;
  getProcessQueue():IProcess[];
  addUpdatedStateProperty(prop:IPropertyAccess):void;
  process():Promise<IPropertyAccess[]>;
  expandStateProperties(updatedStateProperties:IPropertyAccess[]):IPropertyAccess[];
  rebuildBinding(expandedStatePropertyByKey:Map<string,IPropertyAccess>):void;
  updateChildNodes(expandedStateProperties:IPropertyAccess[]):void;
  updateNode(expandedStatePropertyByKey:Map<string,IPropertyAccess>):void;
  execCallback(callback:()=>any):Promise<void>;
  exec():Promise<void>;
  applyNodeUpdatesByBinding(binding:IBinding, callback:(updator:IUpdator)=>any):void;
}

export interface IProps {
  [BindPropertySymbol](prop:string, propAccess:IBindingPropertyAccess);
  [SetBufferSymbol](buffer:{[key:string]:any});
  [GetBufferSymbol]():{[key:string]:any};
  [ClearBufferSymbol]():void;
  [CreateBufferSymbol]():{[key:string]:any};
  [FlushBufferSymbol]():void;
  [ClearSymbol]():void;
  get(target:any, prop:PropertyKey, receiver:IProps):any;
  set(target:any, prop:PropertyKey, value:any, receiver:IProps):boolean;
  ownKeys(target:IProps):(symbol|string)[];
  getOwnPropertyDescriptor(target:IProps, prop:string|symbol):PropertyDescriptor;
}
