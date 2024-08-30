import "../nop";

import { BindPropertySymbol, ClearBufferSymbol, ClearSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component";
import { EventFilterFuncWithOption, FilterFuncWithOption, FilterType, IFilterManager } from "./filter";
import { IGlobalDataProxy } from "../global/global";
import { IState, Proxies, StateClass } from "./state"; // ToDo
import { IContentBindings, INewBinding, INewBindingPropertyAccess, INewBindingSummary, INewPropertyAccess } from "../@types/types";
import { IStateProxy, IStates } from "../newState/types";

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
  config: NewComponentModuleConfig;
  readonly moduleConfig: NewComponentModuleConfig;
  options: NewComponentModuleOptions;
  filters: NewComponentModuleFilters;
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
  readonly component: INewComponent & HTMLElement;
  readonly parentComponent?: INewComponent & HTMLElement;
  readonly initialPromises: PromiseWithResolvers<void>;
  alivePromises: PromiseWithResolvers<void>;
  readonly states: IStates;
  rootBindingManager: IContentBindings; // ToDo
  readonly viewRootElement: ShadowRoot | HTMLElement;
  readonly queryRoot: ShadowRoot | HTMLElement;
  pseudoParentNode?: Node;
  pseudoNode?: Node;
  readonly shadowRootOrDocument: ShadowRoot|Document;
  contextRevision: number;
  useContextRevision(callback: (revision:number)=>void):void;
  readonly bindingSummary: INewBindingSummary;
  readonly updator: IUpdator; // ToDO
  readonly props: IProps; // ToDO
  readonly globals: IGlobalDataProxy; // ToDO

  build():Promise<void>;
  connectedCallback():Promise<void>;
  disconnectedCallback():Promise<void>;
} 

export interface INewDialogComponent {
  dialogPromises: PromiseWithResolvers<any>|undefined;
  returnValue: string;
  readonly useBufferedBind: boolean;
  asyncShowModal(props: {[key: string]: any}): Promise<any>;
  asyncShow(props: {[key: string]: any}): Promise<any>;
  showModal(): void;
  show(): void;
  close(result:any): void;
}

export interface INewPopoverComponent {
  canceled: boolean;
  popoverPromises: PromiseWithResolvers<any> | undefined;
  readonly popoverContextIndexesById: Map<string, number[]>;
  asyncShowPopover(props: {[key: string]: any}): Promise<any>;
  hidePopover(): void;
  cancelPopover(): void;
}
export type Constructor<T = {}> = new (...args: any[]) => T;

export type INewComponent = INewComponentBase & INewCustomComponent & INewDialogComponent & INewPopoverComponent & HTMLElement;

export interface INewProcess {
  readonly target:Function;
  readonly thisArgument:object;
  readonly argumentList:any[];
}

export interface INewUpdator {
//  component: INewComponent;
  readonly processQueue: INewProcess[];
  readonly updatedStateProperties: INewPropertyAccess[];
  readonly expandedStateProperties: INewPropertyAccess[];
  readonly updatedBindings: Set<INewBinding>;
  readonly states: IStates;
  readonly bindingSummary: INewBindingSummary;

  executing: boolean;

  addProcess(target: Function, thisArgument: object, argumentList: any[]): void;
  getProcessQueue(): INewProcess[];
  addUpdatedStateProperty(prop: INewPropertyAccess): void;
  process():Promise<INewPropertyAccess[]>;
  expandStateProperties(updatedStateProperties: INewPropertyAccess[]): INewPropertyAccess[];
  rebuildBinding(expandedStatePropertyByKey: Map<string,INewPropertyAccess>): void;
  updateChildNodes(expandedStateProperties: INewPropertyAccess[]): void;
  updateNode(expandedStatePropertyByKey: Map<string, INewPropertyAccess>): void;
  execCallback(callback: ()=>any): Promise<void>;
  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: INewBinding, callback:(updator: INewUpdator)=>any): void;
}

export interface INewProps {
  [BindPropertySymbol](prop: string, propAccess: INewBindingPropertyAccess): void;
  [SetBufferSymbol](buffer: {[key: string]: any}): void;
  [GetBufferSymbol](): {[key: string]: any};
  [ClearBufferSymbol](): void;
  [CreateBufferSymbol]():{[key: string]: any};
  [FlushBufferSymbol](): void;
  [ClearSymbol](): void;
  get(target: any, prop: PropertyKey, receiver: INewProps): any;
  set(target: any, prop: PropertyKey, value: any, receiver: INewProps): boolean;
  ownKeys(target: INewProps): (symbol|string)[];
  getOwnPropertyDescriptor(target: INewProps, prop: string|symbol): PropertyDescriptor;
}

// ToDo: addProcessをどうするか検討
export type INewUserComponent = Pick<
  INewComponentBase & INewCustomComponent & INewDialogComponent & INewPopoverComponent,
  /* "addProcess" | */ "viewRootElement" | "queryRoot" | "asyncShowModal" | "asyncShow" | "asyncShowPopover" | "cancelPopover"
>;

