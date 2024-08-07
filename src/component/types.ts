import { EventFilterFuncWithOption, FilterFuncWithOption } from "../filter/types";
import { IState } from "../state/types";

export interface IComponent {
  element:Element;

}

export type ComponentModuleConfig = {
  extends?:string; // for customized built-in element, like extends="button"
  debug?:boolean; // debug mode for the component, default is false
  useShadowRoot?:boolean; // attach shadow root to the component, default is false
  useKeyed?:boolean; // use keyed, default is true. keyed is used for the component instance.
  useWebComponent?:boolean; // use web component, default is true. if false then no custom element.
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

export interface Module {
  uuid:string;
  html:string;
  css:string|undefined;
  template:HTMLTemplateElement;
  styleSheet:CSSStyleSheet|undefined;
  State:typeof Object;
  config:ComponentModuleConfig;
  moduleConfig:ComponentModuleConfig;
  options:ComponentModuleOptions;
  filters:ComponentModuleFilters;
  componentModules:{[key:string]:Module}|undefined;
  componentModulesForRegister:{[key:string]:Module}|undefined;
}
