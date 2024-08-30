import { utils } from "../utils";
import { ConnectedCallbackSymbol } from "../@symbols/state";
import { isAttachable } from "./AttachShadow";
import { getStyleSheetList, getNamesFromComponent } from "./AdoptedCss";
import { localizeStyleSheet } from "./StyleSheet";
import { createUpdator } from "./Updator";
import { createProps } from "./Props";
import { createGlobals } from "./Globals";
import { INewComponent, INewCustomComponent, INewProps, INewUpdator, Constructor, INewComponentBase } from "./types";
import { IStates } from "../state/types";
import { IContentBindings, INewBindingSummary } from "../@types/binding";
import { IGlobalDataProxy } from "../global/types";
import { createContentBindings } from "../binding/ContentBindings";
import { createBindingSummary } from "../binding/BindingSummary";
import { createStates } from "../state/States";

const pseudoComponentByNode:Map<Node, INewComponent> = new Map;

const getParentComponent = (_node:Node): INewComponent|undefined => {
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

export function CustomComponent<TBase extends Constructor<HTMLElement & INewComponentBase>>(Base: TBase) {
  return class extends Base implements INewCustomComponent {
    constructor(...args:any[]) {
      super();
      this.#states = createStates(this, Reflect.construct(this.State, [])); // create view model
      this.#bindingSummary = createBindingSummary();
      this.#initialPromises = Promise.withResolvers<void>(); // promises for initialize
      this.#updator = createUpdator(this);
      this.#props = createProps(this);
      this.#globals = createGlobals(this);  
    }

    get component():INewComponent {
      return this as unknown as INewComponent;
    }
    #parentComponent?:INewComponent;
    get parentComponent(): INewComponent | undefined {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this);
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

    #rootBindingManager?: IContentBindings;
    get rootBindingManager(): IContentBindings {
      return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
    }
    set rootBindingManager(bindingManager: IContentBindings) {
      this.#rootBindingManager = bindingManager;
    }

    get viewRootElement():ShadowRoot|HTMLElement {
      return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode as HTMLElement;
    }

    // alias view root element */
    get queryRoot():ShadowRoot|HTMLElement {
      return this.viewRootElement;
    }

    // parent node（use, case of useWebComponent is false）
    #pseudoParentNode:Node|undefined;
    get pseudoParentNode():Node {
      return !this.useWebComponent ? 
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

    // find parent shadow root, or document, for adoptedCSS 
    get shadowRootOrDocument(): ShadowRoot|Document {
      let node = this.parentNode;
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
      if (isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const names = getNamesFromComponent(this);
        const styleSheets = getStyleSheetList(names);
        if (typeof this.styleSheet !== "undefined" ) {
          styleSheets.push(this.styleSheet);
        }
        shadowRoot.adoptedStyleSheets = styleSheets;
      } else {
        if (typeof this.styleSheet !== "undefined") {
          let adoptedStyleSheet = this.styleSheet;
          if (this.useLocalSelector) {
            const localStyleSheet = localStyleSheetByTagName.get(this.tagName);
            if (typeof localStyleSheet !== "undefined") {
              adoptedStyleSheet = localStyleSheet;
            } else {
              adoptedStyleSheet = localizeStyleSheet(this.styleSheet, this.selectorName);
              localStyleSheetByTagName.set(this.tagName, adoptedStyleSheet);
            }
          }
          const shadowRootOrDocument = this.shadowRootOrDocument;
          const adoptedStyleSheets = Array.from(shadowRootOrDocument.adoptedStyleSheets);
          if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
            shadowRootOrDocument.adoptedStyleSheets = [...adoptedStyleSheets, adoptedStyleSheet];
          }
        }
      }
      if (this.useOverscrollBehavior) {
        if (this.tagName === "DIALOG" || this.hasAttribute("popover")) {
          this.style.overscrollBehavior = "contain";
        }
      }

      this.states.writable(async () => {
        await this.states.current[ConnectedCallbackSymbol]();
      });

      // build binding tree and dom 
      this.bindingSummary.update((summary) => {
        const uuid = this.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
        this.rootBindingManager = createContentBindings(this.template, undefined, this);
        this.rootBindingManager.postCreate();
      });
      if (this.useWebComponent) {
        // case of useWebComponent,
        // then append fragment block to viewRootElement
        this.viewRootElement.appendChild(this.rootBindingManager.fragment);
      } else {
        // case of no useWebComponent, 
        // then insert fragment block before pseudo node nextSibling
        this.viewRootElement.insertBefore(this.rootBindingManager.fragment, this.pseudoNode?.nextSibling ?? null);
        // child nodes add pseudoComponentByNode
        this.rootBindingManager.childNodes.forEach(node => pseudoComponentByNode.set(node, this as unknown as INewComponent));
      }
    }

    async connectedCallback() {
      try {
        // wait for parent component initialize
        if (this.parentComponent) {
          await this.parentComponent.initialPromises.promise;
        } else {
        }
  
        if (!this.useWebComponent) {
          // case of no useWebComponent
          const comment = document.createComment(`@@/${this.tagName}`);
          this.pseudoParentNode = this.parentNode ?? utils.raise("parentNode is undefined");
          this.pseudoNode = comment;
          this.pseudoParentNode.replaceChild(comment, this);
        }
  
        // promises for alive
        this.alivePromises = Promise.withResolvers<void>();
  
        await this.build();
        
      } finally {
        this.initialPromises?.resolve && this.initialPromises.resolve();
      }
  
    }
    async disconnectedCallback() {
    }
  };
}