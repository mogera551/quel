import { IBinding, IBindingManager, IBindingSummary, IPropertyAccess } from "./binding";
import { EventFilterFuncWithOption, FilterFuncWithOption, FilterType, IFilterManager } from "./filter";
import { IState, Proxies, StateClass } from "./state";

type ComponentModuleConfig = {
  extends?:string; // for customized built-in element, like extends="button"
  debug?:boolean; // debug mode for the component, default is false
  useShadowRoot?:boolean; // attach shadow root to the component, default is false
  useKeyed?:boolean; // use keyed, default is true. keyed is used for the component instance.
  useWebComponent?:boolean; // use web component, default is true. if false then no use custom element.
  useLocalTagName?:boolean; // use local tag name, default is true. local custom tag is unique in the document.
  useLocalSelector?:boolean; // use local selector, default is true. local selector is unique in the document.
  useOverscrollBehavior?:boolean; // use overscroll-behavior, default is true. overscroll-behavior is used for the component instance.
}

type ComponentModuleOptions = {
  extends?:string; // for customized built-in element, like extends="button"
}

type ComponentModuleFilters = {
  input?:{[key:string]:FilterFuncWithOption};
  output?:{[key:string]:FilterFuncWithOption};
  event?:{[key:string]:EventFilterFuncWithOption};
}

type ComponentModule = {
  html?:string;
  css?:string;
  State?:typeof Object;
  componentModules?:{[key:string]:ComponentModule};
  config?:ComponentModuleConfig;
  options?:ComponentModuleOptions;
  filters?:ComponentModuleFilters;
  moduleConfig?:ComponentModuleConfig;
}

interface IModule {
  uuid: string;
  html: string;
  css?: string;
  template: HTMLTemplateElement;
  styleSheet?: CSSStyleSheet;
  State: typeof Object;
  config: ComponentModuleConfig;
  moduleConfig: ComponentModuleConfig;
  options: ComponentModuleOptions;
  filters: ComponentModuleFilters;
  componentModules?: {[key:string]:IModule};
  componentModulesForRegister?: {[key:string]:IModule};
}

type CustomElementInfo = {
  lowerTagName:string; // lower case tag name
  selectorName:string; // local selector name
  isAutonomousCustomElement:boolean; // is autonomous custom element
  isCostomizedBuiltInElement:boolean; // is customized built-in element
}

type FilterManagers = {
  inputFilterManager:IFilterManager<FilterType.Input>, 
  outputFilterManager:IFilterManager<FilterType.Output>, 
  eventFilterManager:IFilterManager<FilterType.Event>
};

interface IComponentBase {
  get module():IModule;
  get isQuelComponent():boolean;
  get customElementInfo():CustomElementInfo;
  get template():HTMLTemplateElement;
  get styleSheet():CSSStyleSheet|undefined;
  get State():StateClass;
  get inputFilters():{[key:string]:FilterFuncWithOption};
  get outputFilters():{[key:string]:FilterFuncWithOption};
  get eventFilters():{[key:string]:EventFilterFuncWithOption};
  get useShadowRoot():boolean;
  get useWebComponent():boolean;
  get useLocalTagName():boolean;
  get useKeyed():boolean;
  get useLocalSelector():boolean;
  get useOverscrollBehavior():boolean;
  get lowerTagName():string;
  get selectorName():string;
  // is autonomous custom element 
  get isAutonomousCustomElement():boolean;
  // is costomized built-in element
  get isCostomizedBuiltInElement():boolean;
  get filterManagers():FilterManagers;
  get inputFilterManager():IFilterManager<FilterType.Input>;
  get outputFilterManager():IFilterManager<FilterType.Output>;
  get eventFilterManager():IFilterManager<FilterType.Event>;
}

interface ICustomComponent {
  states:Proxies;
  get component():IComponent & HTMLElement;
  get parentComponent():IComponent & HTMLElement;
  get initialPromises():PromiseWithResolvers<void>;
  get alivePromises():PromiseWithResolvers<void>;
  set alivePromises(promises:PromiseWithResolvers<void>);
  get baseState():IState;
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
  get cachableInBuilding():boolean;
  cacheInBuilding(callback:(component:IComponent)=>void):void;
  get shadowRootOrDocument():ShadowRoot|Document;
  get contextRevision():number;
  set contextRevision(revision:number);
  useContextRevision(callback:(revision:number)=>void):void;
  get bindingSummary():IBindingSummary;
  get updator():IUpdator;

  build():Promise<void>;

  connectedCallback():Promise<void>;
  disconnectedCallback():Promise<void>;
} 

type Constructor<T = {}> = new (...args: any[]) => T;

type IComponent = IComponentBase & ICustomComponent & HTMLElement;

interface IProcess {
  target:Function;
  thisArgument:object;
  argumentList:any[];
}

interface IUpdator {
  component:IComponent;
  state:IState;
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