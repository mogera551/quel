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
   * @param {ComponentModule} componentModule 
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
        static useBufferedBind = module.config?.useBufferedBind ?? false;

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
          const config = {};
          const setConfigFromAttribute = (name, flagName, config) => {
            if (this.hasAttribute(name)) {
              config[flagName] = true;
            } else if (this.hasAttribute("no-" + name)) {
              config[flagName] = false;
            } else {
              config[flagName] = this.constructor[flagName];
            }
          }
          setConfigFromAttribute("shadow-root", "useShadowRoot", config);
          setConfigFromAttribute("web-component", "useWebComponent", config);
          setConfigFromAttribute("local-tag-name", "useLocalTagName", config);
          setConfigFromAttribute("keyed", "useKeyed", config);
          setConfigFromAttribute("buffered-bind", "useBufferedBind", config);

          this.initialize(config);
        }

        initialize(config) {
          this.constructor.initializeCallbacks.forEach(callback => callback.apply(this, [config]));
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
 * @param {ComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 * @param {string} customElementName 
 * @param {ComponentModule} componentModule 
 */
export function registerComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = ComponentClassGenerator.generate(componentModule);
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
