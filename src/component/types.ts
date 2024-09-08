import { BindPropertySymbol, ClearBufferSymbol, ClearSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { EventFilterFuncWithOption, FilterFuncWithOption, IFilterManager } from "../filter/types";
import { IGlobalDataProxy } from "../global/types";
import { IStates } from "../state/types";
import { IContentBindings, IBindingPropertyAccess, IBindingSummary } from "../binding/types";
import { IUpdator } from "../updator/types";

export type ComponentModuleConfig = {
  readonly extends?: string; // for customized built-in element, like extends="button"
  readonly debug?: boolean; // debug mode for the component, default is false
  readonly useShadowRoot?: boolean; // attach shadow root to the component, default is false
  readonly useKeyed?: boolean; // use keyed, default is true. keyed is used for the component instance.
  readonly useWebComponent?: boolean; // use web component, default is true. if false then no use custom element.
  readonly useLocalTagName?: boolean; // use local tag name, default is true. local custom tag is unique in the document.
  readonly useLocalSelector?: boolean; // use local selector, default is true. local selector is unique in the document.
  readonly useOverscrollBehavior?: boolean; // use overscroll-behavior, default is true. overscroll-behavior is used for the component instance.
}

export type ComponentModuleOptions = {
  readonly extends?: string; // for customized built-in element, like extends="button"
}

export type ComponentModuleFilters = {
  readonly input?: {[key: string]: FilterFuncWithOption};
  readonly output?: {[key: string]: FilterFuncWithOption};
  readonly event?: {[key: string]: EventFilterFuncWithOption};
}

export type ComponentModule = {
  readonly html?: string;
  readonly css?: string;
  readonly State?:typeof Object;
  readonly componentModules?:{[key:string]:ComponentModule};
  readonly config?: ComponentModuleConfig;
  readonly options?: ComponentModuleOptions;
  readonly filters?: ComponentModuleFilters;
  readonly moduleConfig?: ComponentModuleConfig;
}

export interface IModule {
  readonly uuid: string;
  readonly html: string;
  readonly css?: string;
  readonly template: HTMLTemplateElement;
  readonly styleSheet?: CSSStyleSheet;
  readonly State: typeof Object;
  config: ComponentModuleConfig;
  readonly moduleConfig: ComponentModuleConfig;
  options: ComponentModuleOptions;
  filters: ComponentModuleFilters;
  readonly componentModules?: {[key: string]: IModule};
  readonly componentModulesForRegister?: {[key: string]: IModule};
}

export type CustomElementInfo = {
  readonly lowerTagName: string; // lower case tag name
  readonly selectorName: string; // local selector name
  readonly isAutonomousCustomElement: boolean; // is autonomous custom element
  readonly isCostomizedBuiltInElement: boolean; // is customized built-in element
}

export type FilterManagers = {
  readonly inputFilterManager: IFilterManager<"input">, 
  readonly outputFilterManager: IFilterManager<"output">, 
  readonly eventFilterManager: IFilterManager<"event">
};

export interface IComponentBase {
  readonly module: IModule;
  readonly isQuelComponent: boolean;
  readonly customElementInfo: CustomElementInfo;
  readonly template: HTMLTemplateElement;
  readonly styleSheet?: CSSStyleSheet;
  readonly State: typeof Object;
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
  readonly filterManagers: FilterManagers;
  readonly inputFilterManager: IFilterManager<"input">;
  readonly outputFilterManager: IFilterManager<"output">;
  readonly eventFilterManager: IFilterManager<"event">;
  readonly baseClass: Function;
  readonly thisClass: Function;
  readonly element: HTMLElement;
}

export interface ICustomComponent {
  readonly component: IComponent & HTMLElement;
  readonly parentComponent?: IComponent & HTMLElement;
  readonly initialPromises: PromiseWithResolvers<void>;
  alivePromises: PromiseWithResolvers<void>;
  readonly states: IStates;
  rootBindingManager: IContentBindings; // ToDo
  readonly viewRootElement: ShadowRoot | HTMLElement;
  readonly queryRoot: ShadowRoot | HTMLElement;
  pseudoParentNode?: Node;
  pseudoNode?: Node;
  readonly shadowRootOrDocument: ShadowRoot|Document;
  readonly bindingSummary: IBindingSummary;
  readonly updator: IUpdator;
  readonly props: IProps;
  readonly globals: IGlobalDataProxy;

  build():Promise<void>;
  connectedCallback():Promise<void>;
  disconnectedCallback():Promise<void>;
} 

export interface IDialogComponent {
  dialogPromises: PromiseWithResolvers<any>|undefined;
  returnValue: string;
  readonly useBufferedBind: boolean;
  asyncShowModal(props: {[key: string]: any}): Promise<any>;
  asyncShow(props: {[key: string]: any}): Promise<any>;
  showModal(): void;
  show(): void;
  close(result:any): void;
}

export interface IPopoverComponent {
  canceled: boolean;
  popoverPromises: PromiseWithResolvers<any> | undefined;
  readonly popoverContextIndexesById: Map<string, number[]>;
  asyncShowPopover(props: {[key: string]: any}): Promise<any>;
  hidePopover(): void;
  cancelPopover(): void;
}

export type Constructor<T = {}> = new (...args: any[]) => T;

export type IComponent = IComponentBase & ICustomComponent & IDialogComponent & IPopoverComponent & HTMLElement;

export interface IProcess {
  readonly target:Function;
  readonly thisArgument:object;
  readonly argumentList:any[];
}

export interface IProps {
  [BindPropertySymbol](prop: string, propAccess: IBindingPropertyAccess): void;
  [SetBufferSymbol](buffer: {[key: string]: any}): void;
  [GetBufferSymbol](): {[key: string]: any};
  [ClearBufferSymbol](): void;
  [CreateBufferSymbol]():{[key: string]: any};
  [FlushBufferSymbol](): void;
  [ClearSymbol](): void;
  get(target: any, prop: PropertyKey, receiver: IProps): any;
  set(target: any, prop: PropertyKey, value: any, receiver: IProps): boolean;
  ownKeys(target: IProps): (symbol|string)[];
  getOwnPropertyDescriptor(target: IProps, prop: string|symbol): PropertyDescriptor;
}

// ToDo: addProcessをどうするか検討
export type IUserComponent = Pick<
  IComponentBase & ICustomComponent & IDialogComponent & IPopoverComponent,
  /* "addProcess" | */ "element" | "viewRootElement" | "queryRoot" | "asyncShowModal" | "asyncShow" | "asyncShowPopover" | "cancelPopover"
>;

