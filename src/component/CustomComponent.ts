import { Constructor, IComponentBase, ICustomComponent } from "./types";
import { createStates, getProxies } from "../state/Proxies";
import { isAttachable } from "./AttachShadow";
import { AdoptedCss } from "./AdoptedCss";
import { localizeStyleSheet } from "./StyleSheet";
import { ConnectedCallbackSymbol } from "../state/Const";
import { Proxies, State } from "../state/types";

const pseudoComponentByNode:Map<Node,IComponentBase & HTMLElement> = new Map;

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

function CustomComponent<TBase extends Constructor>(Base: TBase & IComponentBase &HTMLElement) {
  return class extends Base implements ICustomComponent {
    constructor(...args:any[]) {
      super();
      this.
      this._isWritable = false;
      this.#states = getProxies(this.component, this.component.State as State); // create view model
      this._rootBinding = undefined;
//      this._props = createProps(this); // create property for parent component connection
//      this._globals = createGlobals(); // create property for global connection
//      this._initialPromises = undefined;
//      this._alivePromises = undefined;
  
  
      this._pseudoParentNode = undefined;
      this._pseudoNode = undefined;
      
      this._filters = undefined;
  
      this._bindingSummary = new BindingSummary;
  
      this._initialPromises = Promise.withResolvers(); // promises for initialize
  
      this._contextRevision = 0;
  
      this._cachableInBuilding = false;
  
      this._updator = new Updator(this);      
    }

    #props;
    #globals;
    #initialPromises;
    #alivePromises;
    #states:Proxies;
    #initialize() {
  

    }
    #build() {

    }
    get component():IComponentBase & HTMLElement {
      return this as unknown as IComponentBase & HTMLElement;
    }
    #parentComponent?:IComponentBase & HTMLElement;
    get parentComponent():IComponentBase & HTMLElement {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this.component as Node) as IComponentBase & HTMLElement;
      }
      return this.#parentComponent;
    }    
    async connectedCallback() {
      const component = this.component;
      if (isAttachable(component.tagName.toLowerCase()) && component.useShadowRoot && component.useWebComponent) {
        const shadowRoot = component.attachShadow({mode: 'open'});
        const names = AdoptedCss.getNamesFromComponent(this);
        const styleSheets = AdoptedCss.getStyleSheetList(names);
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
          const shadowRootOrDocument = this.shadowRootOrDocument;
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

      await this.state[ConnectedCallbackSymbol]();

  

    }
    async disconnectedCallback() {

    }



  };
}