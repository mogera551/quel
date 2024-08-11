import { IUpdator, IComponentBase, Constructor, ICustomComponent, IComponent, IProps } from "../@types/component";
import { getProxies } from "../state/Proxies";
import { isAttachable } from "./AttachShadow";
import { getStyleSheetList, getNamesFromComponent } from "./AdoptedCss";
import { localizeStyleSheet } from "./StyleSheet";
import { ConnectedCallbackSymbol } from "../state/Const";
import { IState, Proxies } from "../@types/state";
import { BindingManager } from "../binding/Binding";
import { utils } from "../utils";
import { IBindingManager, IBindingSummary } from "../@types/binding";
import { BindingSummary } from "../binding/BindingSummary";
import { Updator } from "./Updator";
import { createProps } from "./Props";
import { IGlobalData } from "../@types/global";
import { createGlobals } from "./Globals";

const pseudoComponentByNode:Map<Node,IComponent> = new Map;

const getParentComponent = (_node:Node):Node|undefined => {
  do {
    let node = _node.parentNode;
    if (node == null) return undefined;
    if (Reflect.get(node, "isQuelComponent")) return node;
    if (node instanceof ShadowRoot) {
      if (Reflect.get(node.host, "isQuelComponent")) return node.host;
      node = node.host;
    }
    const component = pseudoComponentByNode.get(node);
    if (typeof component !== "undefined") return component;
  } while(true);
};

const localStyleSheetByTagName:Map<string,CSSStyleSheet> = new Map;

function CustomComponent<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements ICustomComponent {
    constructor(...args:any[]) {
      super();
      const component = this.component;
      this.#states = getProxies(component, component.State); // create view model
      this.#bindingSummary = new BindingSummary;
      this.#initialPromises = Promise.withResolvers<void>(); // promises for initialize
      this.#updator = new Updator(component);
      this.#props = createProps(component);
      this.#globals = createGlobals(component);  
    }

    //#globals;
    #states:Proxies;
    get states():Proxies {
      return this.#states;
    }

    get component():IComponent & HTMLElement {
      return this as unknown as IComponent & HTMLElement;
    }
    #parentComponent?:IComponent & HTMLElement;
    get parentComponent():IComponent & HTMLElement {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this.component as Node) as IComponent & HTMLElement;
      }
      return this.#parentComponent;
    }

    #initialPromises:PromiseWithResolvers<void>;
    get initialPromises():PromiseWithResolvers<void> {
      return this.#initialPromises;
    }

    #alivePromises:PromiseWithResolvers<void>|undefined;
    get alivePromises():PromiseWithResolvers<void> {
      return this.#alivePromises ?? utils.raise("alivePromises is undefined");
    }
    set alivePromises(promises:PromiseWithResolvers<void>) {
      this.#alivePromises = promises;
    }

    get baseState():Object {
      return this.#states.base;
    }
    get writableState():IState {
      return this.#states.write;
    }
    get readonlyState():IState {
      return this.#states.readonly;
    }
    get currentState():IState {
      return this.isWritable ? this.writableState : this.readonlyState;
    }

    #rootBindingManager?:IBindingManager;
    get rootBindingManager():IBindingManager {
      return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
    }
    set rootBindingManager(bindingManager:IBindingManager) {
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
    #pseudoNode:Node|undefined;
    get pseudoNode():Node {
      return this.#pseudoNode ?? utils.raise("pseudoNode is undefined");
    }
    set pseudoNode(node:Node) {
      this.#pseudoNode = node;
    }

    #isWritable:boolean = false;
    get isWritable():boolean {
      return this.#isWritable;
    }
    async stateWritable(callback:()=>Promise<void>):Promise<void> {
      this.#isWritable = true;
      try {
        await callback();
      } finally {
        this.#isWritable = false;
      }
    }

    #cachableInBuilding:boolean = false;
    get cachableInBuilding():boolean {
      return this.#cachableInBuilding;
    }
    cacheInBuilding(callback:(component:IComponent)=>void):void {
      this.#cachableInBuilding = true;
      try {
        callback(this.component);
      } finally {
        this.#cachableInBuilding = false;
      }
    }

    // find parent shadow root, or document, for adoptedCSS 
    get shadowRootOrDocument():ShadowRoot|Document {
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

    #bindingSummary:IBindingSummary;
    get bindingSummary():IBindingSummary {
      return this.#bindingSummary;
    }

    #updator:IUpdator;
    get updator():IUpdator {
      return this.#updator;
    }

    #props:IProps;
    get props():IProps {
      return this.#props;
    }

    #globals:IGlobalData;
    get globals():IGlobalData {
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

      await component.currentState[ConnectedCallbackSymbol]();

      component.cacheInBuilding((component:IComponent) => {
        // build binding tree and dom 
        component.bindingSummary.update((summary) => {
          const uuid = component.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
          component.rootBindingManager = BindingManager.create(component, component.template, uuid);
          component.rootBindingManager.postCreate();
        });
        if (component.useWebComponent) {
          // case of useWebComponent,
          // then append fragment block to viewRootElement
          component.viewRootElement.appendChild(component.rootBindingManager.fragment);
        } else {
          // case of no useWebComponent, 
          // then insert fragment block before pseudo node nextSibling
          component.viewRootElement.insertBefore(component.rootBindingManager.fragment, component.pseudoNode.nextSibling);
          // child nodes add pseudoComponentByNode
          component.rootBindingManager.nodes.forEach(node => pseudoComponentByNode.set(node, component));
        }
  
      });


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