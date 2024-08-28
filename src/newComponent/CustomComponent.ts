import { utils } from "../utils";
//import { IUpdator, Constructor, ICustomComponent, IComponent, IProps } from "../@types/component";
import { IState, Proxies } from "../@types/state";
import { ConnectedCallbackSymbol } from "../@symbols/state";
import { IBindingManager, IBindingSummary } from "../@types/binding";
import { IGlobalData } from "../@types/global";
import { getProxies } from "../state/Proxies";
import { isAttachable } from "./AttachShadow";
import { getStyleSheetList, getNamesFromComponent } from "./AdoptedCss";
import { localizeStyleSheet } from "./StyleSheet";
import { BindingManager } from "../binding/Binding";
import { BindingSummary } from "../binding/BindingSummary";
import { Updator } from "./Updator";
import { createProps } from "./Props";
import { createGlobals } from "./Globals";
import { INewComponent, INewCustomComponent, INewProps, INewUpdator, Constructor } from "./types";
import { IStateProxy, IStates } from "../newState/types";
import { IContentBindings, INewBindingSummary } from "../newBinding/types";
import { IGlobalDataProxy } from "../newGlobal/types";
import { createContentBindings } from "../newBinding/ContentBindings";
import { createBindingSummary } from "../newBinding/BindingSummary";
import { createStates } from "../newState/States";

const pseudoComponentByNode:Map<Node,INewComponent> = new Map;

const getParentComponent = (_node:Node):INewComponent|undefined => {
  let node:Node|null = _node;
  do {
    node = node.parentNode;
    if (node == null) return undefined;
    if (Reflect.get(node, "isQuelComponent") === true) return node as INewComponent;
    if (node instanceof ShadowRoot) {
      if (Reflect.get(node.host, "isQuelComponent") === true) return node.host as INewComponent;
      node = node.host;
    }
    const psuedoComponent = pseudoComponentByNode.get(node);
    if (typeof psuedoComponent !== "undefined") return psuedoComponent;
  } while(true);
};

const localStyleSheetByTagName:Map<string,CSSStyleSheet> = new Map;

export function CustomComponent<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements INewCustomComponent {
    constructor(...args:any[]) {
      super();
      const component = this.component;
      this.#states = createStates(component, Reflect.construct(component.State, [])); // create view model
      this.#bindingSummary = createBindingSummary();
      this.#initialPromises = Promise.withResolvers<void>(); // promises for initialize
      this.#updator = new Updator(component);
      this.#props = createProps(component);
      this.#globals = createGlobals(component);  
    }

    get component():INewComponent & HTMLElement {
      return this as unknown as INewComponent & HTMLElement;
    }
    #parentComponent?:INewComponent & HTMLElement;
    get parentComponent():INewComponent & HTMLElement {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this.component as Node) as INewComponent & HTMLElement;
      }
      return this.#parentComponent;
    }

    #initialPromises: PromiseWithResolvers<void>;
    get initialPromises():PromiseWithResolvers<void> {
      return this.#initialPromises;
    }

    #alivePromises: PromiseWithResolvers<void>|undefined;
    get alivePromises():PromiseWithResolvers<void> {
      return this.#alivePromises ?? utils.raise("alivePromises is undefined");
    }
    set alivePromises(promises:PromiseWithResolvers<void>) {
      this.#alivePromises = promises;
    }

    #states: IStates;
    get states(): IStates {
      return this.#states;
    }
    get baseState(): Object {
      return this.#states.base;
    }
    get currentState(): IStateProxy {
      return this.#states.current;
    }

    #rootBindingManager?: IContentBindings;
    get rootBindingManager(): IContentBindings {
      return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
    }
    set rootBindingManager(bindingManager: IContentBindings) {
      this.#rootBindingManager = bindingManager;
    }

    get viewRootElement():ShadowRoot|HTMLElement {
      const component = this.component;
      return component.useWebComponent ? (component.shadowRoot ?? component) : component.pseudoParentNode as HTMLElement;
    }

    // alias view root element */
    get queryRoot():ShadowRoot|HTMLElement {
      return this.viewRootElement;
    }

    // parent node（use, case of useWebComponent is false）
    #pseudoParentNode:Node|undefined;
    get pseudoParentNode():Node {
      const component = this.component;
      return !component.useWebComponent ? 
        (this.#pseudoParentNode ?? utils.raise("pseudoParentNode is undefined")) : 
        utils.raise("mixInComponent: useWebComponent must be false");
    }
    set pseudoParentNode(node:Node) {
      this.#pseudoParentNode = node;
    }

    // pseudo node（use, case of useWebComponent is false） */
    #pseudoNode?: Node;
    get pseudoNode(): Node {
      return this.#pseudoNode ?? utils.raise("pseudoNode is undefined");
    }
    set pseudoNode(node:Node) {
      this.#pseudoNode = node;
    }

    async stateWritable(callback:()=>Promise<void>): Promise<void> {
      return await this.#states.writable(async () => {
        return await callback();
      });
    }

    // find parent shadow root, or document, for adoptedCSS 
    get shadowRootOrDocument(): ShadowRoot|Document {
      const component = this.component;
      let node = component.parentNode;
      while(node) {
        if (node instanceof ShadowRoot) {
          return node;
        }
        node = node.parentNode;
      }
      return document;
    }

    #contextRevision:number = 0;
    get contextRevision() {
      return this.#contextRevision;
    }
    set contextRevision(value) {
      this.#contextRevision = value;
    }
    useContextRevision(callback:(revision:number)=>void):void {
      this.#contextRevision++;
      callback(this.#contextRevision);
    }

    #bindingSummary: INewBindingSummary;
    get bindingSummary(): INewBindingSummary {
      return this.#bindingSummary;
    }

    #updator: INewUpdator;
    get updator(): INewUpdator {
      return this.#updator;
    }

    #props: INewProps;
    get props(): INewProps {
      return this.#props;
    }

    #globals: IGlobalDataProxy;
    get globals(): IGlobalDataProxy {
      return this.#globals;
    }
  
    async build() {
      const component = this.component;
      if (isAttachable(component.tagName.toLowerCase()) && component.useShadowRoot && component.useWebComponent) {
        const shadowRoot = component.attachShadow({mode: 'open'});
        const names = getNamesFromComponent(component);
        const styleSheets = getStyleSheetList(names);
        if (typeof component.styleSheet !== "undefined" ) {
          styleSheets.push(component.styleSheet);
        }
        shadowRoot.adoptedStyleSheets = styleSheets;
      } else {
        if (typeof component.styleSheet !== "undefined") {
          let adoptedStyleSheet = component.styleSheet;
          if (component.useLocalSelector) {
            const localStyleSheet = localStyleSheetByTagName.get(component.tagName);
            if (typeof localStyleSheet !== "undefined") {
              adoptedStyleSheet = localStyleSheet;
            } else {
              adoptedStyleSheet = localizeStyleSheet(component.styleSheet, component.selectorName);
              localStyleSheetByTagName.set(component.tagName, adoptedStyleSheet);
            }
          }
          const shadowRootOrDocument = component.shadowRootOrDocument;
          const adoptedStyleSheets = Array.from(shadowRootOrDocument.adoptedStyleSheets);
          if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
            shadowRootOrDocument.adoptedStyleSheets = [...adoptedStyleSheets, adoptedStyleSheet];
          }
        }
      }
      if (component.useOverscrollBehavior) {
        if (component.tagName === "DIALOG" || component.hasAttribute("popover")) {
          component.style.overscrollBehavior = "contain";
        }
      }

      component.stateWritable(async () => {
        await component.states.current[ConnectedCallbackSymbol]();
      });

      // build binding tree and dom 
      component.bindingSummary.update((summary) => {
        const uuid = component.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
        // ToDo: unknownをなるべく避ける
        component.rootBindingManager = createContentBindings(component.template, undefined, this as unknown as INewComponent);
        //component.rootBindingManager.postCreate();
      });
      if (component.useWebComponent) {
        // case of useWebComponent,
        // then append fragment block to viewRootElement
        component.viewRootElement.appendChild(component.rootBindingManager.fragment);
      } else {
        // case of no useWebComponent, 
        // then insert fragment block before pseudo node nextSibling
        component.viewRootElement.insertBefore(component.rootBindingManager.fragment, component.pseudoNode?.nextSibling ?? null);
        // child nodes add pseudoComponentByNode
        component.rootBindingManager.childNodes.forEach(node => pseudoComponentByNode.set(node, component));
      }
    }

    async connectedCallback() {
      const component = this.component;
      try {
        // wait for parent component initialize
        if (this.parentComponent) {
          await this.parentComponent.initialPromises.promise;
        } else {
        }
  
        if (!component.useWebComponent) {
          // case of no useWebComponent
          const comment = document.createComment(`@@/${component.tagName}`);
          component.pseudoParentNode = component.parentNode ?? utils.raise("parentNode is undefined");
          component.pseudoNode = comment;
          component.pseudoParentNode.replaceChild(comment, component);
        }
  
        // promises for alive
        component.alivePromises = Promise.withResolvers<void>();
  
        await this.build();
        
      } finally {
        this.initialPromises?.resolve && this.initialPromises.resolve();
      }
  
    }
    async disconnectedCallback() {

    }



  };
}