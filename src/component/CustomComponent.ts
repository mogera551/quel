import { Constructor, IComponentBase, ICustomComponent } from "./types";

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


function CustomComponent<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements ICustomComponent {
    constructor(...args:any[]) {
      super();
      this._isWritable = false;
      this._viewModels = createStates(this, componentClass.ViewModel); // create view model
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
    }
    async disconnectedCallback() {

    }



  };
}