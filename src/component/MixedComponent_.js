import "../types.js";
import { Symbols } from "../Symbols.js";
import { createProps } from "./Props.js";
import { createGlobals } from "./Globals.js";
import { isAttachable } from "./AttachShadow.js";
import { utils } from "../utils.js";
import { BindingManager } from "../binding/Binding.js";
import { createViewModels } from "../viewModel/Proxy.js";
import { BindingSummary } from "../binding/BindingSummary.js";
import * as AdoptedCss from "./AdoptedCss.js";
import { localizeStyleSheet } from "./StyleSheet.js";
import { InputFilterManager, OutputFilterManager, EventFilterManager } from "../filter/Manager.js";
import { Updator } from "./Updator.js";

/** @type {WeakMap<Node,Component>} */
const pseudoComponentByNode = new WeakMap;

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node.constructor[Symbols.isComponent]) return node;
    if (node instanceof ShadowRoot) {
      if (node.host.constructor[Symbols.isComponent]) return node.host;
      node = node.host;
    }
    const component = pseudoComponentByNode.get(node);
    if (typeof component !== "undefined") return component;
  } while(true);
};

/** @type {ComponentBase} */
export class MixedComponent {
  /** @type {ViewModelProxy} view model proxy */
  get baseViewModel() {
    return this._viewModels["base"];
  }

  /** @type {ViewModelProxy} view model proxy */
  get writableViewModel() {
    return this._viewModels["writable"];
  }

  /** @type {ViewModelProxy} view model proxy */
  get readOnlyViewModel() {
    return this._viewModels["readonly"];
  }

  /** @type {boolean} */
  get isWritable() {
    return this._isWritable;
  }

  /** @type {ViewModelProxy} view model proxy */
  get viewModel() {
    if (this.cachableInBuilding) return this.readOnlyViewModel;
    return this.isWritable ? this.writableViewModel : this.readOnlyViewModel;
  }

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  }
  set rootBinding(value) {
    this._rootBinding = value;
  }

  /** @type {Object<string,any>} parent component property */
  get props() {
    return this._props;
  }
  set props(value) {
    this._props[Symbols.setBuffer](value);
  }

  /** @type {Object<string,any>} global object */
  get globals() {
    return this._globals;
  }

  /** @type {Promises} initial promises */
  get initialPromises() {
    return this._initialPromises;
  }

  /** @type {Promises} alive promises */
  get alivePromises() {
    return this._alivePromises;
  }
  set alivePromises(value) {
    this._alivePromises = value;
  }

  /** @type {Component} parent component */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  }

  /** @type {boolean} use shadowRoot */
  get useShadowRoot() {
    return this._useShadowRoot;
  }

  /** @type {boolean} use web component */
  get useWebComponent() {
    return this._useWebComponent;
  }

  /** @type {boolean} use local tag name */
  get useLocalTagName() {
    return this._useLocalTagName;
  }

  /** @type {boolean} use keyed */
  get useKeyed() {
    return this._useKeyed;
  }

  /** @type {boolean} use local selector */
  get useLocalSelector() {
    return this._useLocalSelector;
  }

  /** @type {boolean} use overscroll behavior */
  get useOverscrollBehavior() {
    return this._useOverscrollBehavior;
  }

  /** @type {boolean} use buffered bind */
  get useBufferedBind() {
    return this.hasAttribute("buffered-bind");
  }

  /** @type {ShadowRoot|HTMLElement} view root element */
  get viewRootElement() {
    return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode;
  }

  /** @type {ShadowRoot|HTMLElement} alias view root element */
  get queryRoot() {
    return this.viewRootElement;
  }

  /** @type {Node} parent node（use, case of useWebComponent is false） */
  get pseudoParentNode() {
    return !this.useWebComponent ? this._pseudoParentNode : utils.raise("mixInComponent: useWebComponent must be false");
  }

  /** @type {Node} pseudo node（use, case of useWebComponent is false） */
  get pseudoNode() {
    return this._pseudoNode;
  }

  /** @type {{in:InputFilterManager,out:OutputFilterManager,event:EventFilterManager}} filters */
  get filters() {
    return this._filters;
  }

  /** @type {BindingSummary} binding summary */
  get bindingSummary() {
    return this._bindingSummary;
  }

  /** @type {ShadowRoot|Document} find parent shadow root, or document, for adoptedCSS  */
  get shadowRootOrDocument() {
    let node = this.parentNode;
    while(node) {
      if (node instanceof ShadowRoot) {
        return node;
      }
      node = node.parentNode;
    }
    return document;
  }

  get contextRevision() {
    return this._contextRevision;
  }
  set contextRevision(value) {
    this._contextRevision = value;
  }

  get cachableInBuilding() {
    return this._cachableInBuilding;
  }
  set cachableInBuilding(value) {
    this._cachableInBuilding = value;
  }

  get updator() {
    return this._updator;
  }
  /** 
   * initialize
   * @returns {void}
   */
  initializeCallback() {
    /** @type {Component.constructor} */
    const componentClass = this.constructor;
    /**
     * set members
     */
    this._isWritable = false;
    this._viewModels = createViewModels(this, componentClass.ViewModel); // create view model
    this._rootBinding = undefined;
    this._props = createProps(this); // create property for parent component connection
    this._globals = createGlobals(); // create property for global connection
    this._initialPromises = undefined;
    this._alivePromises = undefined;

    this._parentComponent = undefined;

    this._useShadowRoot = componentClass.useShadowRoot;
    this._useWebComponent = componentClass.useWebComponent;
    this._useLocalTagName = componentClass.useLocalTagName;
    this._useKeyed = componentClass.useKeyed;
    this._useLocalSelector = componentClass.useLocalSelector;
    this._useOverscrollBehavior = componentClass.useOverscrollBehavior;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = undefined;

    this._bindingSummary = new BindingSummary;

    this._initialPromises = Promise.withResolvers(); // promises for initialize

    this._contextRevision = 0;

    this._cachableInBuilding = false;

    this._updator = new Updator(this);      
    //console.log("mixInComponent:initializeCallback");
  }

  /**
   * build component (called from connectedCallback)
   * setting filters
   * create and attach shadowRoot
   * initialize view model
   * @returns {Promise<any>}
   */
  async build() {
//    console.log(`components[${this.tagName}].build`);
    this.cachableInBuilding = false;
    /**
     * @type {{
     *   template:HTMLTemplateElement,
     *   styleSheet:CSSStyleSheet,
     *   inputFilterManager:InputFilterManager,
     *   outputFilterManager:OutputFilterManager,
     *   eventFilterManager:EventFilterManager
     * }} 
     */
    const { template, styleSheet, inputFilterManager, outputFilterManager, eventFilterManager } = this.constructor; // from static members of ComponentBase class 
    
    // setting filters
    this._filters = {
      in: inputFilterManager,
      out: outputFilterManager,
      event: eventFilterManager,
    };
    // create and attach shadowRoot
    // adopt css
    if (isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
      this.attachShadow({mode: 'open'});
      const names = AdoptedCss.getNamesFromComponent(this);
      const styleSheets = AdoptedCss.getStyleSheetList(names);
      if (typeof styleSheet !== "undefined" ) {
        styleSheets.push(styleSheet);
      }
      this.shadowRoot.adoptedStyleSheets = styleSheets;
    } else {
      if (typeof styleSheet !== "undefined") {
        let adoptedStyleSheet = styleSheet;
        if (this.useLocalSelector) {
          if (typeof this.constructor.localStyleSheet !== "undefined") {
            adoptedStyleSheet = this.constructor.localStyleSheet;
          } else {
            adoptedStyleSheet = this.constructor.localStyleSheet = localizeStyleSheet(styleSheet, this.selectorName);
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

    // initialize ViewModel（call viewModel's $connectedCallback）
    await this.viewModel[Symbols.connectedCallback]();

    this.cachableInBuilding = true;

    // build binding tree and dom 
    this.bindingSummary.update((summary) => {
      this.rootBinding = BindingManager.create(this, template, template.dataset["uuid"]);
      this.rootBinding.postCreate();
    });

    if (!this.useWebComponent) {
      // case of no useWebComponent, 
      // then insert fragment block before pseudo node nextSibling
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling);
      // child nodes add pseudoComponentByNode
      this.rootBinding.nodes.forEach(node => pseudoComponentByNode.set(node, this));
    } else {
      // case of useWebComponent,
      // then append fragment block to viewRootElement
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    this.cachableInBuilding = false;
  }

  /**
   * callback on adding this component to DOM tree
   * @returns {void}
   */
  async connectedCallback() {
//    console.log(`components[${this.tagName}].connectedCallback`);
    try {
      // wait for parent component initialize
      if (this.parentComponent) {
        await this.parentComponent.initialPromises.promise;
      } else {
      }

      if (!this.useWebComponent) {
        // case of no useWebComponent
        const comment = document.createComment(`@@/${this.tagName}`);
        this._pseudoParentNode = this.parentNode;
        this._pseudoNode = comment;
        this.pseudoParentNode.replaceChild(comment, this);
      }

      // promises for alive
      this.alivePromises = Promise.withResolvers();

      await this.build();
      
    } finally {
      this.initialPromises?.resolve && this.initialPromises.resolve();
    }
  }

  /**
   * callback on deleting this component from DOM tree
   * @returns {void}
   */
  disconnectedCallback() {
    this.rootBinding?.dispose();
    this.props[Symbols.clear]();
    this.alivePromises?.resolve && this.alivePromises.resolve(this.props);
    this.initialize();
  }

  /**
   * 
   * @param {()=>void} func 
   * @param {object} thisArg 
   * @param {any[]} args 
   */
  addProcess(func, thisArg, args) {
    this.updator.addProcess(func, thisArg, args ?? []);
  }

  /**
   * use writable view model
   * @param {()=>void)} callback 
   */
  async writableViewModelCallback(callback) {
    this._isWritable = true;
    try {
      await callback();
    } finally {
      this._isWritable = false;
    }
  }

  get accessibleProperties() {
    return [ "addProcess", "viewRootElement ", "queryRoot" ];
  }
}
