import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { EventFilterFuncWithOption, FilterFuncWithOption } from "../filter/types";
import { StateClass } from "../state/types";

export type ComponentModuleConfig = {
  extends?:string; // for customized built-in element, like extends="button"
  debug?:boolean; // debug mode for the component, default is false
  useShadowRoot?:boolean; // attach shadow root to the component, default is false
  useKeyed?:boolean; // use keyed, default is true. keyed is used for the component instance.
  useWebComponent?:boolean; // use web component, default is true. if false then no use custom element.
  useLocalTagName?:boolean; // use local tag name, default is true. local custom tag is unique in the document.
  useLocalSelector?:boolean; // use local selector, default is true. local selector is unique in the document.
  useOverscrollBehavior?:boolean; // use overscroll-behavior, default is true. overscroll-behavior is used for the component instance.
}

export type ComponentModuleOptions = {
  extends?:string; // for customized built-in element, like extends="button"
}

export type ComponentModuleFilters = {
  input?:{[key:string]:FilterFuncWithOption};
  output?:{[key:string]:FilterFuncWithOption};
  event?:{[key:string]:EventFilterFuncWithOption};
}

export type ComponentModule = {
  html?:string;
  css?:string;
  State?:typeof Object;
  componentModules?:{[key:string]:ComponentModule};
  config?:ComponentModuleConfig;
  options?:ComponentModuleOptions;
  filters?:ComponentModuleFilters;
  moduleConfig?:ComponentModuleConfig;
}

export interface IModule {
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

export type CustomElementInfo = {
  lowerTagName:string; // lower case tag name
  selectorName:string; // local selector name
  isAutonomousCustomElement:boolean; // is autonomous custom element
  isCostomizedBuiltInElement:boolean; // is customized built-in element
}

export type FilterManagers = {
  inputFilterManager:InputFilterManager, 
  outputFilterManager:OutputFilterManager, 
  eventFilterManager:EventFilterManager
};

export interface IComponentBase {
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
  get inputFilterManager():InputFilterManager;
  get outputFilterManager():OutputFilterManager;
  get eventFilterManager():EventFilterManager;
}

export interface ICustomComponent {
  get parentComponent():IComponentBase & HTMLElement;
  connectedCallback():void;
  disconnectedCallback():void;
} 

export type Constructor<T = {}> = new (...args: any[]) => T;

export type IComponent = IComponentBase & ICustomComponent & HTMLElement;