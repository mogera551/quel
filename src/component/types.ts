import { EventFilterFuncWithOption, FilterFuncWithOption, IFilterManager } from "../filter/types";
import { IStateProxy } from "../state/types";
import { IContentBindings, INewBindingSummary } from "../binding/types";
import { IUpdator } from "../updator/types";
import { ILoopContext } from "../loopContext/types";
import { IProps } from "../props/types";
import { IPopoverInfo } from "../popover/types";

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
  html: string;
  css?: string;
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
  readonly quelIsQuelComponent: boolean;
  quelHtml: string;
  readonly quelTemplate: HTMLTemplateElement;
  quelCss?: string;
  readonly quelStyleSheet?: CSSStyleSheet;
  readonly quelStateClass: typeof Object;
  readonly quelUseShadowRoot: boolean;
  readonly quelUseWebComponent: boolean;
  readonly quelUseLocalTagName: boolean;
  readonly quelUseKeyed: boolean;
  readonly quelUseLocalSelector: boolean;
  readonly quelUseOverscrollBehavior: boolean;
  readonly quelLowerTagName: string;
  readonly quelSelectorName: string;
  // is autonomous custom element 
  readonly quelIsAutonomousCustomElement: boolean;
  // is costomized built-in element
  readonly quelIsCostomizedBuiltInElement: boolean;
  readonly quelInputFilterManager: IFilterManager<"input">;
  readonly quelOutputFilterManager: IFilterManager<"output">;
  readonly quelEventFilterManager: IFilterManager<"event">;
  readonly quelBaseClass: Function;
  readonly quelThisClass: Function;
  /**
   * ToDo: このプロパティを廃止するかどうかの検討
   */
  readonly quelElement: HTMLElement;
}

export interface ICustomComponent {
  readonly quelParentComponent?: IComponent & HTMLElement;
  readonly quelInitialPromises: PromiseWithResolvers<void>;
  quelAlivePromises: PromiseWithResolvers<void>;
  readonly quelState: IStateProxy;
  readonly quelViewRootElement: ShadowRoot | HTMLElement;
  readonly quelQueryRoot: ShadowRoot | HTMLElement;
  readonly quelPseudoParentNode: Node;
  readonly quelPseudoNode: Node;
  readonly quelBindingSummary: INewBindingSummary;
  readonly quelUpdator: IUpdator;
  readonly quelProps: IProps;
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
  readonly popoverInfo: IPopoverInfo
  asyncShowPopover(props: {[key: string]: any}): Promise<any>;
  hidePopover(): void;
  cancelPopover(): void;
}

export type Constructor<T = {}> = new (...args: any[]) => T;

export type IComponent = IComponentBase & ICustomComponent & IDialogComponent & IPopoverComponent & HTMLElement;

export interface IProcess {
  readonly target: Function;
  readonly thisArgument: object | undefined;
  readonly argumentList: any[];
  readonly loopContext: ILoopContext | undefined;
}

// ToDo: addProcessをどうするか検討
export type IUserComponent = Pick<
  IComponentBase & ICustomComponent & IDialogComponent & IPopoverComponent,
  /* "addProcess" | */ "quelElement" | "quelViewRootElement" | "quelQueryRoot" | "asyncShowModal" | "asyncShow" | "asyncShowPopover" | "cancelPopover"
>;

