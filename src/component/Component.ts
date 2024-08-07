import "../types.js";
import { Symbols } from "../Symbols.js";
import { Module } from "./Module_.js";
import { MixedComponent } from "./MixedComponent.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";
import { MixedDialog } from "./MixedDialog.js";
import { MixedPopover } from "../popover/MixedPopover.js";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager.js";
import { ComponentModule } from "./types.js";

/**
 * generate unique component class
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export function generateComponentClass(componentModule:ComponentModule) {
  /** @type {(module:Module)=>HTMLElement.constructor} */
  const getBaseClass:typeof HTMLElement = function (module:ComponentModule):typeof HTMLElement {
    return class extends HTMLElement {

      /** @type {HTMLTemplateElement} */
      static template = module.template;

      /** @type {CSSStyleSheet|undefined} */
      static styleSheet = module.styleSheet;

      /** @type {CSSStyleSheet|undefined} */
      static localStyleSheet;

      /** @type {ViewModel.constructor} */
      static ViewModel = module.ViewModel ?? module.State ?? class {};

      /**@type {Object<string,FilterFuncWithOption>} */
      static inputFilters = module.filters?.input ?? {};

      /** @type {Object<string,FilterFuncWithOption>} */
      static outputFilters = module.filters?.output ?? {};

      /** @type {Object<string,EventFilterFuncWithOption>} */
      static eventFilters = module.filters?.event ?? {};

      /** @type {boolean} */
      static useShadowRoot = module.config?.useShadowRoot ?? config.useShadowRoot;

      /** @type {boolean} */
      static useWebComponent = module.config?.useWebComponent ?? config.useWebComponent;

      /** @type {boolean} */
      static useLocalTagName = module.config?.useLocalTagName ?? config.useLocalTagName;

      /** @type {boolean} */
      static useKeyed = module.config?.useKeyed ?? config.useKeyed;

      /** @type {boolean} */
      static useLocalSelector = module.config?.useLocalSelector ?? config.useLocalSelector;

      /** @type {boolean} */
      static useOverscrollBehavior = module.config?.useOverscrollBehavior ?? config.useOverscrollBehavior;

      /** @type {boolean} */
      static get [Symbols.isComponent] () {
        return true;
      }

      /**  */
      static initializeCallbacks = [];

      static accessiblePropertiesFn = [];

      static allProperties = [ "initialize", "accessibleProperties", "allProperties" ];

      /** @type {string} */
      static lowerTagName;
      /** @type {string} */
      get lowerTagName() {
        return this.constructor.lowerTagName;
      }

      /** @type {string} */
      static selectorName;
      /** @type {string} */
      get selectorName() {
        return this.constructor.selectorName;
      }

      /** @type {boolean} */
      static isAutonomousCustomElement;
      /** @type {boolean} is autonomous custom element */
      get isAutonomousCustomElement() {
        return this.constructor.isAutonomousCustomElement;
      }

      /** @type {boolean} */
      static isCostomizedBuiltInElement;
      /** @type {boolean} is costomized built-in element */
      get isCostomizedBuiltInElement() {
        return this.constructor.isCostomizedBuiltInElement;
      }

      /** @type {InputFilterManager} */
      static inputFilterManager = new InputFilterManager;

      /** @type {OutputFilterManager} */
      static outputFilterManager = new OutputFilterManager;

      /** @type {EventFilterManager} */
      static eventFilterManager = new EventFilterManager;

      /**
       */
      constructor() {
        super();
        if (typeof this.constructor.lowerTagName === "undefined") {
          const lowerTagName =  this.tagName.toLowerCase();
          const isAutonomousCustomElement = lowerTagName.includes("-");
          const customName = this.getAttribute("is");
          const isCostomizedBuiltInElement = customName ? true : false;
          this.constructor.selectorName = 
            isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
          this.constructor.lowerTagName = lowerTagName;
          this.constructor.isAutonomousCustomElement = isAutonomousCustomElement;
          this.constructor.isCostomizedBuiltInElement = isCostomizedBuiltInElement;
        }
        this.initialize();
      }

      initialize() {
        this.constructor.initializeCallbacks.forEach(callback => callback.apply(this, []));
      }

      get accessibleProperties() {
        const accessibleProperties = [];
        return this.constructor.accessiblePropertiesFn.flatMap(fn => fn.apply(this, []) ?? []).concat(accessibleProperties);
      }
      get allProperties() {
        return this.constructor.allProperties;
      }
      static {
        // setting filters
        for(const [name, filterFunc] of Object.entries(this.inputFilters)) {
          this.inputFilterManager.registerFilter(name, filterFunc);
        }
        for(const [name, filterFunc] of Object.entries(this.outputFilters)) {
          this.outputFilterManager.registerFilter(name, filterFunc);
        }
        for(const [name, filterFunc] of Object.entries(this.eventFilters)) {
          this.eventFilterManager.registerFilter(name, filterFunc);
        }
      }
    };
  };

  /** @type {Module} */
  const module = Object.assign(new Module, componentModule);
  module.filters = Object.assign({}, componentModule.filters);
  module.config = Object.assign({}, componentModule.moduleConfig ?? componentModule.config);
  module.options = Object.assign({}, componentModule.options);

  // generate new class, for customElements not define same class
  const componentClass = getBaseClass(module);
  const extendsTag = module.config?.extends ?? module.options?.extends;
  if (typeof extendsTag === "undefined") {
    // case of autonomous custom element
  } else {
    // case of customized built-in element
    // change class extends to extends constructor
    // See http://var.blog.jp/archives/75174484.html
    /** @type {HTMLElement.constructor} */
    const extendClass = document.createElement(extendsTag).constructor;
    componentClass.prototype.__proto__ = extendClass.prototype;
    componentClass.__proto__ = extendClass;
  }

  /**
   * mix in class
   * @param {Object.constructor} mixedClass
   */
  const classMixIn = (mixedClass) => {
    // static properties and static accessors
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixedClass))) {
      // exclude name, length, prototype
      if (!desc.enumerable && typeof desc.get === "undefined") continue;
      if (key === "accessibleProperties") {
        componentClass.accessiblePropertiesFn.push(desc.get ?? (() => desc.value));
      } else {
        Object.defineProperty(componentClass, key, desc);
      }
      componentClass.allProperties.push(key);
    }
    // instance accessors and methods
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixedClass.prototype))) {
      // exclude constructor
      if (key === "constructor") continue;
      if (key === "initializeCallback") {
        componentClass.initializeCallbacks.push(desc.value);
      } else if (key === "accessibleProperties") {
        componentClass.accessiblePropertiesFn.push(desc.get ?? (() => desc.value));
      } else {
        Object.defineProperty(componentClass.prototype, key, desc);
      }
      componentClass.allProperties.push(key);
    }

  }
  classMixIn(MixedComponent);
  classMixIn(MixedDialog);
  classMixIn(MixedPopover);

  // register component's subcomponents 
  registerComponentModules(module.componentModulesForRegister);

  return componentClass;
}

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {ComponentModule} componentModule 
 */
export function registerComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = generateComponentClass(componentModule);
  const extendsTag = componentModule.moduleConfig?.extends ?? componentModule.options?.extends;
  if (typeof extendsTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:extendsTag });
  }
}

/**
 * 
 * @param {Object<string,ComponentModule>} componentModules 
 */
export function registerComponentModules(componentModules) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules ?? {})) {
    registerComponentModule(customElementName, userComponentModule);
  }
}
