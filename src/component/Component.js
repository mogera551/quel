import "../types.js";
import { Symbols } from "../Symbols.js";
import { Module } from "./Module.js";
import { MixedComponent } from "./MixedComponent.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";
import { MixedDialog } from "./MixedDialog.js";
import { MixedPopover } from "../popover/MixedPopover.js";

/**
 * generate unique component class
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export function generateComponentClass(componentModule) {
  /** @type {(module:Module)=>HTMLElement.constructor} */
  const getBaseClass = function (module) {
    return class extends HTMLElement {

      /** @type {HTMLTemplateElement} */
      static template = module.template;

      /** @type {CSSStyleSheet|undefined} */
      static styleSheet = module.styleSheet;

      /** @type {ViewModel.constructor} */
      static ViewModel = module.ViewModel;

      /**@type {Object<string,FilterFunc>} */
      static inputFilters = module.filters?.input ?? {};

      /** @type {Object<string,FilterFunc>} */
      static outputFilters = module.filters?.output ?? {};

      /** @type {Object<string,EventFilterFunc>} */
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
      static get [Symbols.isComponent] () {
        return true;
      }

      /**  */
      static initializeCallbacks = [];

      /**
       */
      constructor() {
        super();
        this.initialize();
      }

      initialize() {
        this.constructor.initializeCallbacks.forEach(callback => callback.apply(this, []));
      }
    };
  };

  /** @type {Module} */
  const module = Object.assign(new Module, componentModule);
  module.filters = Object.assign({}, componentModule.filters);
  module.config = Object.assign({}, componentModule.config);
  module.options = Object.assign({}, componentModule.options);

  // generate new class, for customElements not define same class
  const componentClass = getBaseClass(module);
  if (typeof module.options?.extends === "undefined") {
    // case of autonomous custom element
  } else {
    // case of customized built-in element
    // change class extends to extends constructor
    // See http://var.blog.jp/archives/75174484.html
    /** @type {HTMLElement.constructor} */
    const extendClass = document.createElement(module.options.extends).constructor;
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
      Object.defineProperty(componentClass, key, desc);
    }
    // instance accessors and methods
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixedClass.prototype))) {
      // exclude constructor
      if (key === "constructor") continue;
      if (key === "initializeCallback") {
        componentClass.initializeCallbacks.push(desc.value);
      } else {
        Object.defineProperty(componentClass.prototype, key, desc);
      }
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
  if (typeof componentModule.options?.extends === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:componentModule.options.extends });
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
