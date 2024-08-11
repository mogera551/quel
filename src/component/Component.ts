import { IsComponentSymbol, ModuleSymbol, CustomElementInfoSymbol, SetCustomElementInfoSymbol, FilterManagersSymbol, SetFilterManagersSymbol } from "../@symbols/component";
import { Module } from "./Module.js";
import { MixedComponent } from "./MixedComponent_.js";
import { utils } from "../utils";
import { config } from "../Config.js";
import { MixedDialog } from "./MixedDialog_.js";
import { MixedPopover } from "../popover/MixedPopover_.js";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { IModule, ComponentModule, CustomElementInfo, FilterManagers, IComponentBase } from "../@types/component";
import { replaceBaseClass } from "./ReplaceBaseClass.js";
import { StateClass } from "../@types/state";

const moduleByConstructor:Map<Function,IModule> = new Map;
const customElementInfoByTagName:Map<string,CustomElementInfo> = new Map;
const filterManagersByTagName:Map<string,FilterManagers> = new Map;

/**
 * generate unique component class
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export const generateComponentClass = (componentModule:ComponentModule) => {
  const getBaseClass = function (module:IModule):typeof HTMLElement {
    const baseClass = class extends HTMLElement implements IComponentBase {
      #module?:IModule;
      get module():IModule {
        if (typeof this.#module === "undefined") {
          this.#module = moduleByConstructor.get(this.constructor) ?? utils.raise(`module is not found for ${this.constructor.name}`);
        }
        return this.#module;
      }

      get isQuelComponent():boolean {
        return true;
      }
      #customElementInfo?:CustomElementInfo;
      get customElementInfo():CustomElementInfo {
        if (typeof this.#customElementInfo === "undefined") {
          this.#customElementInfo = customElementInfoByTagName.get(this.tagName) ?? utils.raise(`customElementInfo is not found for ${this.tagName}`);
        }
        return this.#customElementInfo;
      }
      #setCustomElementInfo() {
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

      get template():HTMLTemplateElement {
        return this.module.template;
      }

      get styleSheet():CSSStyleSheet|undefined {
        return this.module.styleSheet;
      }

      get State():StateClass {
        return this.module.State;
      }

      get inputFilters():{[key:string]:FilterFuncWithOption} {
        return this.module.filters.input ?? {};
      }

      get outputFilters():{[key:string]:FilterFuncWithOption} {
        return this.module.filters.output ?? {};
      }

      get eventFilters():{[key:string]:EventFilterFuncWithOption} {
        return this.module.filters.event ?? {};
      }

      get useShadowRoot():boolean {
        return this.module.moduleConfig.useShadowRoot ?? config.useShadowRoot;
      }

      get useWebComponent():boolean {
        return this.module.moduleConfig.useWebComponent ?? config.useWebComponent;
      }

      get useLocalTagName():boolean {
        return this.module.moduleConfig.useLocalTagName ?? config.useLocalTagName;
      }

      get useKeyed():boolean {
        return this.module.moduleConfig.useKeyed ?? config.useKeyed;
      }

      get useLocalSelector():boolean {
        return this.module.moduleConfig.useLocalSelector ?? config.useLocalSelector;
      }

      get useOverscrollBehavior():boolean {
        return this.module.moduleConfig.useOverscrollBehavior ?? config.useOverscrollBehavior;
      }

      get lowerTagName():string {
        return this.customElementInfo.lowerTagName;
      }

      get selectorName():string {
        return this.customElementInfo.selectorName;
      }

      // is autonomous custom element 
      get isAutonomousCustomElement():boolean {
        return this.customElementInfo.isAutonomousCustomElement;
      }

      // is costomized built-in element
      get isCostomizedBuiltInElement() {
        return this.customElementInfo.isCostomizedBuiltInElement;
      }

      #filterManagers?:FilterManagers;
      get filterManagers():FilterManagers {
        if (typeof this.#filterManagers === "undefined") {
          this.#filterManagers = filterManagersByTagName.get(this.tagName) ?? utils.raise(`filterManagers is not found for ${this.tagName}`);
        }
        return this.#filterManagers;
      }
      #setFilterManagers() {
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

      get inputFilterManager():InputFilterManager {
        return this.filterManagers.inputFilterManager;
      }

      get outputFilterManager():OutputFilterManager {
        return this.filterManagers.outputFilterManager;
      }

      get eventFilterManager() {
        return this.filterManagers.eventFilterManager;
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
        this.#setCustomElementInfo();
        this.#setFilterManagers();
        //this.initialize();
      }
/*
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
*/
    };
    moduleByConstructor.set(baseClass, module);
    return baseClass;
  };

  const module:IModule = Object.assign(new Module, componentModule);
  module.filters = Object.assign({}, componentModule.filters);
  module.config = Object.assign({}, componentModule.moduleConfig);
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
    replaceBaseClass(componentClass, extendsTag);
/*
    const extendClass = document.createElement(extendsTag).constructor;
    componentClass.prototype.__proto__ = extendClass.prototype;
    componentClass.__proto__ = extendClass;
*/
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
