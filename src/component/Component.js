import "../types.js";
import { Symbols } from "../Symbols.js";
import { Module } from "./Module.js";
import { mixInComponent } from "./MixInComponent.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";

/**
 * generate unique comonent class
 * for customElements.define
 */
export class ComponentClassGenerator {
  
  /**
   * generate unique component class
   * @param {UserComponentModule} componentModule 
   * @returns {Component.constructor}
   */
  static generate(componentModule) {
    /** @type {(module:Module)=>HTMLElement.constructor} */
    const getBaseClass = function (module) {
      return class extends HTMLElement {

        /** @type {HTMLTemplateElement} */
        static template = module.template;

        /** @type {ViewModel.constructor} */
        static ViewModel = module.ViewModel;

        /**@type {Object<string,FilterFunc>} */
        static inputFilters = module.inputFilters;

        /** @type {Object<string,FilterFunc>} */
        static outputFilters = module.outputFilters;

        /** @type {boolean} */
        static useShadowRoot = module.useShadowRoot ?? config.useShadowRoot;

        /** @type {boolean} */
        static useWebComponent = module.useWebComponent ?? config.useWebComponent;

        /** @type {boolean} */
        static useLocalTagName = module.useLocalTagName ?? config.useLocalTagName;

        /** @type {boolean} */
        static useKeyed = module.useKeyed ?? config.useKeyed;

        /** @type {boolean} */
        get [Symbols.isComponent] () {
          return true;
        }

        /**
         */
        constructor() {
          super();
          this.initialize();
        }
      };
    };
  
    /** @type {Module} */
    const module = Object.assign(new Module, componentModule);

    // generate new class, for customElements not define same class
    const componentClass = getBaseClass(module);
    if (typeof module.extends === "undefined") {
      // case of autonomous custom element
    } else {
      // case of customized built-in element
      // change class extends to extends constructor
      // See http://var.blog.jp/archives/75174484.html
      /** @type {HTMLElement.constructor} */
      const extendClass = document.createElement(module.extends).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // mix in component
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }

    // regist component's subcomponents 
    registComponentModules(module.componentModulesForRegist);

    return componentClass;
  }
}

/**
 * function for generate unique component class
 * @param {UserComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}

/**
 * regist component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {UserComponentModule} componentModule 
 */
export function registComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = ComponentClassGenerator.generate(componentModule);
  if (typeof componentModule.extends === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:componentModule.extends });
  }
}

/**
 * 
 * @param {Object<string,UserComponentModule>} componentModules 
 */
export function registComponentModules(componentModules) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules ?? {})) {
    registComponentModule(customElementName, userComponentModule);
  }
}