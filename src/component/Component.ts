import { utils } from "../utils";
import { FilterFuncWithOption, EventFilterFuncWithOption } from "../filter/types";
import { Module } from "./Module";
import { config } from "../Config";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { CustomComponent } from "./CustomComponent";
import { DialogComponent } from "./DialogComponent";
import { PopoverComponent } from "./PopoverComponent";
import { Constructor, IComponentBase, IModule, ComponentModule, CustomElementInfo, FilterManagers } from "./types";

const moduleByConstructor:Map<Function,IModule> = new Map;
const customElementInfoByTagName:Map<string,CustomElementInfo> = new Map;
const filterManagersByTagName:Map<string,FilterManagers> = new Map;

/**
 * generate unique component class
 */
export const generateComponentClass = (componentModule:ComponentModule):typeof HTMLElement => {
  const getBaseClass = function (module:IModule, baseConstructor:typeof HTMLElement):Constructor<HTMLElement & IComponentBase>  {
    const baseClass = class extends baseConstructor implements IComponentBase {
      #module?:IModule;
      get module():IModule {
        if (typeof this.#module === "undefined") {
          this.#module = moduleByConstructor.get(this.thisClass) ?? utils.raise(`module is not found for ${this.constructor.name}`);
        }
        return this.#module;
      }

      get isQuelComponent():boolean {
        return true;
      }
      #customElementInfo?: CustomElementInfo;
      get customElementInfo(): CustomElementInfo {
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

      get template(): HTMLTemplateElement {
        return this.module.template;
      }

      get styleSheet(): CSSStyleSheet|undefined {
        return this.module.styleSheet;
      }

      get State(): typeof Object {
        return this.module.State;
      }

      get inputFilters():{[key:string]: FilterFuncWithOption} {
        return this.module.filters.input ?? {};
      }

      get outputFilters():{[key:string]: FilterFuncWithOption} {
        return this.module.filters.output ?? {};
      }

      get eventFilters():{[key:string]: EventFilterFuncWithOption} {
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

      #filterManagers?: FilterManagers;
      get filterManagers(): FilterManagers {
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

      get inputFilterManager(): InputFilterManager {
        return this.filterManagers.inputFilterManager;
      }

      get outputFilterManager(): OutputFilterManager {
        return this.filterManagers.outputFilterManager;
      }

      get eventFilterManager(): EventFilterManager {
        return this.filterManagers.eventFilterManager;
      }

      constructor() {
        super();
        this.#setCustomElementInfo();
        this.#setFilterManagers();
      }
      static baseClass: Function = baseConstructor;
      get baseClass():Function {
        return Reflect.get(this.constructor, "baseClass");
      }
      static thisClass: Function|undefined;
      get thisClass(): Function {
        return Reflect.get(this.constructor, "thisClass");
      }
    };
    baseClass.thisClass = baseClass;
    moduleByConstructor.set(baseClass, module);
    return baseClass;
  };

  const module:IModule = Object.assign(new Module, componentModule);
  module.filters = Object.assign({}, componentModule.filters);
  module.config = Object.assign({}, componentModule.moduleConfig);
  module.options = Object.assign({}, componentModule.options);

  const extendsTag = module.config?.extends ?? module.options?.extends;
  const baseConstructor = extendsTag ? document.createElement(extendsTag).constructor : HTMLElement;
  // generate new class, for customElements not define same class
  const componentClass = getBaseClass(module, baseConstructor as typeof HTMLElement);

  // mix in component class
  const extendedComponentClass = PopoverComponent(DialogComponent(CustomComponent(componentClass))); 

  // register component's subcomponents 
  registerComponentModules(module.componentModulesForRegister ?? {});

  return extendedComponentClass;
}

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 */
export function registerComponentModule(customElementName:string, componentModule:ComponentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = generateComponentClass(componentModule);
  const extendsTag = componentModule.moduleConfig?.extends ?? componentModule.options?.extends;
  if (typeof extendsTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:extendsTag });
  }
}

export function registerComponentModules(componentModules:{[key:string]:ComponentModule}) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules)) {
    registerComponentModule(customElementName, userComponentModule);
  }
}
