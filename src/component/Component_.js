import { IsComponentSymbol, ModuleSymbol, CustomElementInfoSymbol, SetCustomElementInfoSymbol, FilterManagersSymbol, SetFilterManagersSymbol } from "../@symbols/component.js";
import { Module } from "./Module.js";
import { MixedComponent } from "./MixedComponent_.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";
import { MixedDialog } from "./MixedDialog_.js";
import { MixedPopover } from "../popover/MixedPopover_.js";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager.js";

/** @type {Map<Function,Module>} */
const moduleByConstructor = new Map;
const customElementInfoByTagName = new Map;
const filterManagersByTagName = new Map;

/**
 * generate unique component class
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export const generateComponentClass = (componentModule) => {
  /** @type {(module:Module)=>HTMLElement.constructor} */
  const getBaseClass = function (module) {
    const baseClass = class extends HTMLElement {
      /** @type {Module} */
      #module;
      get [ModuleSymbol]() {
        if (typeof this.#module === "undefined") {
          this.#module = moduleByConstructor.get(this.constructor) ?? utils.raise(`module is not found for ${this.constructor.name}`);
        }
        return this.#module;
      }
      /** @type {boolean} */
      get [IsComponentSymbol]() {
        return true;
      }
      /** @type {CustomElementInfo} */
      #ustomElementInfo;
      get [CustomElementInfoSymbol]() {
        if (typeof this.#customElementInfo === "undefined") {
          this.#customElementInfo = customElementInfoByTagName.get(this.tagName) ?? utils.raise(`customElementInfo is not found for ${this.tagName}`);
        }
        return this.#customElementInfo;
      }
      [SetCustomElementInfoSymbol]() {
        const customeElementInfo = customElementInfoByTagName.get(this.tagName);
        if (typeof customeElementInfo === "undefined") {
          const lowerTagName =  this.tagName.toLowerCase();
          const isAutonomousCustomElement = lowerTagName.includes("-");
          const customName = this.getAttribute("is");
          const isCostomizedBuiltInElement = customName ? true : false;
          const selectorName = isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
          customElementInfoByTagName.set(this.tagName, 
            { selectorName, lowerTagName, isAutonomousCustomElement, isCostomizedBuiltInElement });
        }
      }

      /** @type {HTMLTemplateElement} */
      get template() {
        return this[ModuleSymbol].template;
      }

      /** @type {CSSStyleSheet|undefined} */
      get styleSheet() {
        return this[ModuleSymbol].styleSheet;
      }

      /** @type {typeof Object} */
      get State() {
        return this[ModuleSymbol].State;
      }

      /**@type {Object<string,FilterFuncWithOption>} */
      get inputFilters() {
        return this[ModuleSymbol].inputFilters ?? {};
      }

      /** @type {Object<string,FilterFuncWithOption>} */
      get outputFilters() {
        return this[ModuleSymbol].outputFilters ?? {};
      }

      /** @type {Object<string,EventFilterFuncWithOption>} */
      get eventFilters() {
        return this[ModuleSymbol].eventFilters ?? {};
      }

      /** @type {boolean} */
      get useShadowRoot() {
        return this[ModuleSymbol].useShadowRoot ?? config.useShadowRoot;
      }

      /** @type {boolean} */
      get useWebComponent() {
        return this[ModuleSymbol].useWebComponent ?? config.useWebComponent;
      }

      /** @type {boolean} */
      get useLocalTagName() {
        return this[ModuleSymbol].useLocalTagName ?? config.useLocalTagName;
      }

      /** @type {boolean} */
      get useKeyed() {
        return this[ModuleSymbol].useKeyed ?? config.useKeyed;
      }

      /** @type {boolean} */
      get useLocalSelector() {
        return this[ModuleSymbol].useLocalSelector ?? config.useLocalSelector;
      }

      /** @type {boolean} */
      get useOverscrollBehavior() {
        return this[ModuleSymbol].useOverscrollBehavior ?? config.useOverscrollBehavior;
      }

      /** @type {string} */
      get lowerTagName() {
        return this.customeElementInfo.lowerTagName;
      }

      /** @type {string} */
      get selectorName() {
        return this.customeElementInfo.selectorName;
      }

      /** @type {boolean} is autonomous custom element */
      get isAutonomousCustomElement() {
        return this.customeElementInfo.isAutonomousCustomElement;
      }

      /** @type {boolean} is costomized built-in element */
      get isCostomizedBuiltInElement() {
        return this.customeElementInfo.isCostomizedBuiltInElement;
      }

      #filterManagers;
      get [FilterManagersSymbol]() {
        if (typeof this.#filterManagers === "undefined") {
          this.#filterManagers = filterManagersByTagName.get(this.tagName) ?? utils.raise(`filterManagers is not found for ${this.tagName}`);
        }
        return this.#filterManagers;
      }
      [SetFilterManagersSymbol]() {
        const filterManagers = filterManagersByTagName.get(this.tagName);
        if (typeof filterManagers === "undefined") {
          const filterManagers = {
            inputFilterManager: new InputFilterManager,
            outputFilterManager: new OutputFilterManager,
            eventFilterManager: new EventFilterManager,
          };
          for(const [name, filterFunc] of Object.entries(this.inputFilters)) {
            filterManagers.inputFilterManager.registerFilter(name, filterFunc);
          }
          for(const [name, filterFunc] of Object.entries(this.outputFilters)) {
            filterManagers.outputFilterManager.registerFilter(name, filterFunc);
          }
          for(const [name, filterFunc] of Object.entries(this.eventFilters)) {
            filterManagers.eventFilterManager.registerFilter(name, filterFunc);
          }
          filterManagersByTagName.set(this.tagName, filterManagers);
        }
      }

      /** @type {InputFilterManager} */
      get inputFilterManager() {
        return this[FilterManagersSymbol].inputFilterManager;
      }

      /** @type {OutputFilterManager} */
      get outputFilterManager() {
        return this[FilterManagersSymbol].outputFilterManager;
      }

      /** @type {EventFilterManager} */
      get eventFilterManager() {
        return this[FilterManagersSymbol].eventFilterManager;
      }

      /** @type {CSSStyleSheet|undefined} */
      static localStyleSheet;

      /**  */
      static initializeCallbacks = [];

      static accessiblePropertiesFn = [];

      static allProperties = [ "initialize", "accessibleProperties", "allProperties" ];

      /**
       */
      constructor() {
        super();
        this[SetCustomElementInfoSymbol]();
        this[SetFilterManagersSymbol]();
        this.initialize();
      }

      get module() {
        return moduleByConstructor.get(this.constructor);
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
    moduleByConstructor.set(baseClass, module);
    return baseClass;
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
