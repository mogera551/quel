import "../types.js";
import { Symbols } from "../Symbols.js";
import { Module } from "./Module.js";
import { mixInComponent } from "./MixInComponent.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";
import { dialogMixIn } from "./DialogMixIn.js";
import { popoverMixIn } from "./PopoverMixIn.js";

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

        /** @type {Object<string,EventFilterFunc>} */
        static eventFilters = module.eventFilters;

        /** @type {boolean} */
        static useShadowRoot = module.useShadowRoot ?? config.useShadowRoot;

        /** @type {boolean} */
        static useWebComponent = module.useWebComponent ?? config.useWebComponent;

        /** @type {boolean} */
        static useLocalTagName = module.useLocalTagName ?? config.useLocalTagName;

        /** @type {boolean} */
        static useKeyed = module.useKeyed ?? config.useKeyed;

        /** @type {boolean} */
        static useBufferedBind = module.useBufferedBind ?? config.useBufferedBind;

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
          const options = {};
          const setOptionFromAttribute = (name, flagName, options) => {
            if (this.hasAttribute(name)) {
              options[flagName] = true;
            } else if (this.hasAttribute("no-" + name)) {
              options[flagName] = false;
            } else {
              options[flagName] = this.constructor[flagName];
            }
          }
          setOptionFromAttribute("shadow-root", "useShadowRoot", options);
          setOptionFromAttribute("web-component", "useWebComponent", options);
          setOptionFromAttribute("local-tag-name", "useLocalTagName", options);
          setOptionFromAttribute("keyed", "useKeyed", options);
          setOptionFromAttribute("buffered-bind", "useBufferedBind", options);

          this.initialize(options);
        }

        initialize(options) {
          this.constructor.initializeCallbacks.forEach(callback => callback.apply(this, [options]));
        }
      };
    };
  
    /** @type {Module} */
    const module = Object.assign(new Module, componentModule);

    // generate new class, for customElements not define same class
    const componentClass = getBaseClass(module);
    if (typeof module.extendTag === "undefined") {
      // case of autonomous custom element
    } else {
      // case of customized built-in element
      // change class extends to extends constructor
      // See http://var.blog.jp/archives/75174484.html
      /** @type {HTMLElement.constructor} */
      const extendClass = document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // mix in component
    const mixIn = (mixIn) => {
      for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixIn))) {
        if (key === "initializeCallback") {
          componentClass.initializeCallbacks.push(mixIn.initializeCallback);
        } else {
          Object.defineProperty(componentClass.prototype, key, desc);
        }
      }
    }
    mixIn(mixInComponent);
    mixIn(dialogMixIn);
    mixIn(popoverMixIn);

    // register component's subcomponents 
    registerComponentModules(module.componentModulesForRegister);

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
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {UserComponentModule} componentModule 
 */
export function registerComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = ComponentClassGenerator.generate(componentModule);
  if (typeof componentModule.extendTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
  }
}

/**
 * 
 * @param {Object<string,UserComponentModule>} componentModules 
 */
export function registerComponentModules(componentModules) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules ?? {})) {
    registerComponentModule(customElementName, userComponentModule);
  }
}

/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {string}
 */
export function getCustomTagFromImportMeta(importMeta) {
  const url = new URL(importMeta.url);
  const tagName = url.search.slice(1);
  return tagName;
}
