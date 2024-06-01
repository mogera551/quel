import "../types.js";
import { Symbols } from "../Symbols.js";
import { createProps } from "./Props.js";
import { createGlobals } from "./Globals.js";
import { Thread } from "../thread/Thread.js";
import { UpdateSlot } from "../thread/UpdateSlot.js";
import { isAttachable } from "./AttachShadow.js";
import { utils } from "../utils.js";
import { BindingManager } from "../binding/Binding.js";
import { createViewModels } from "../viewModel/Proxy.js";
import { Phase } from "../thread/Phase.js";
import { BindingSummary } from "../binding/BindingSummary.js";
import { viewModelize } from "../viewModel/ViewModelize.js";
import * as AdoptedCss from "./AdoptedCss.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { localizeStyleSheet } from "./StyleSheet.js";
import { InputFilterManager, OutputFilterManager, EventFilterManager } from "../filter/Manager.js";

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

  /** @type {ViewModelProxy} view model proxy */
  get viewModel() {
    if (typeof this.updateSlot === "undefined" || 
      (this.updateSlot.phase !== Phase.gatherUpdatedProperties)) {
      return this.writableViewModel;
    } else {
      return this.readOnlyViewModel;
    }
  }

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  }
  set rootBinding(value) {
    this._rootBinding = value;
  }

  /** @type {Thread} thread */
  get thread() {
    return this._thread;
  }
  set thread(value) {
    this._thread = value;
  }

  /** @type {UpdateSlot} update slot */
  get updateSlot() {
    if (typeof this._thread === "undefined") {
      return undefined;
    }
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, phase => {
        if (phase === Phase.gatherUpdatedProperties) {
          this.viewModel[Symbols.clearCache]();
        }
      });
      this.thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  }
  // for unit test mock
  set updateSlot(value) {
    this._updateSlot = value;
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

  /** 
   * initialize
   * @returns {void}
   */
  initializeCallback() {
    /** @type {class<Component>} */
    const componentClass = this.constructor;
    /**
     * set members
     */

    this._viewModels = createViewModels(this, componentClass.ViewModel); // create view model
    this._rootBinding = undefined;
    this._thread = undefined;
    this._updateSlot = undefined;
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
    
    this._filters = {
      in: new InputFilterManager,
      out: new OutputFilterManager,
      event: new EventFilterManager,
    };

    this._bindingSummary = new BindingSummary;

    this._initialPromises = Promise.withResolvers(); // promises for initialize

    this._setOfObservedAttributes = new Set;
    //console.log("mixInComponent:initializeCallback");
  }

  /**
   * build component (called from connectedCallback)
   * setting filters
   * create and attach shadowRoot
   * create thread
   * initialize view model
   * @returns {Promise<any>}
   */
  async build() {
//    console.log(`components[${this.tagName}].build`);
    /** @type {CSSStyleSheet} styleSheet */
    const { template, styleSheet, inputFilters, outputFilters, eventFilters } = this.constructor; // from static members of ComponentBase class 
    
    // setting filters
    for(const [name, filterFunc] of Object.entries(inputFilters)) {
      if (name in this.filters.in) utils.raise(`mixInComponent: already exists filter ${name}`);
      this.filters.in.registerFilter(name, filterFunc);
    }
    for(const [name, filterFunc] of Object.entries(outputFilters)) {
      if (name in this.filters.out) utils.raise(`mixInComponent: already exists filter ${name}`);
      this.filters.out.registerFilter(name, filterFunc);
    }
    for(const [name, filterFunc] of Object.entries(eventFilters)) {
      if (name in this.filters.event) utils.raise(`mixInComponent: already exists filter ${name}`);
      this.filters.event.registerFilter(name, filterFunc);
    }
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

    // create thread
    this.thread = new Thread;

    // attribue
    if (this.useWebComponent) {
      for(let i = 0; i < this.attributes.length; i++) {
        const attr = this.attributes[i];
        const [prefix, name] = attr.name.split(":");
        if (prefix === "props") {
          this.props[Symbols.bindProperty](name);
          this._setOfObservedAttributes.add(attr.name);
        }
      }
    }

    // initialize ViewModel（call viewModel's $connectedCallback）
    await this.viewModel[Symbols.connectedCallback]();

    // buid binding tree and dom 
    this.rootBinding = BindingManager.create(this, template);
    this.rootBinding.registerBindingsToSummary();
    this.rootBinding.applyToNode();
    this.bindingSummary.flush();

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

    // update slot wakeup
    if (this.updateSlot.isEmpty) {
      this.updateSlot.waitPromises.resolve(true);
    }
    // wait for update slot
    await this.updateSlot.alivePromises.promise;
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
    this.alivePromises?.resolve && this.alivePromises.resolve(this.props);
  }

  /**
   * update binding nodes
   * called from update slot's node updator
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  updateNode(propertyAccessByViewModelPropertyKey) {
    this.rootBinding && BindingManager.updateNode(this.rootBinding, propertyAccessByViewModelPropertyKey);
  }

  /** 
   * @type {string[]} 
   * @static
   */
  static get observedAttributes() {
    const viewModelInfo = viewModelize(Reflect.construct(this.ViewModel, []));
    this._propByObservedAttribute = new Map(
      viewModelInfo.primitiveProps
      .filter(prop => !prop.startsWith("_"))
      .map(prop => [`props:${utils.toKebabCase(prop)}`, prop])
    );
    return Array.from(this._propByObservedAttribute.keys());
  }
  /**
   * @type {Map<string,string>}
   * @static
   */
  static get propByObservedAttribute() {
    return this._propByObservedAttribute;
  }
  /**
   * callback for attribute changed
   * @param {string} name 
   * @param {string} oldValue 
   * @param {string} newValue 
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._setOfObservedAttributes.has(name)) return;
    const propName = this.constructor.propByObservedAttribute.get(name);
    if (typeof propName === "undefined") return;
    if (typeof this.updateSlot === "undefined") return;
    const changePropsEvent = new CustomEvent("changeprops");
    changePropsEvent.propName = name;
    changePropsEvent.propValue = newValue;
    this.dispatchEvent(changePropsEvent);
    if (this.updateSlot.phase !== Phase.updateViewModel) {
      this.viewModel[Symbols.notifyForDependentProps](name, []);
    }

  }

  addProcess(func, thisArg, args) {
    const process = new ProcessData(func, thisArg, args ?? []);
    this.updateSlot.addProcess(process);
  }
}
