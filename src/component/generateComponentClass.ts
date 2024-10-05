import { utils } from "../utils";
import { FilterFuncWithOption, EventFilterFuncWithOption } from "../filter/types";
import { createModule, Module } from "./createModule";
import { config } from "../Config";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { CustomComponent } from "./CustomComponent";
import { DialogComponent } from "./DialogComponent";
import { PopoverComponent } from "./PopoverComponent";
import { Constructor, IComponentBase, IModule, ComponentModule, CustomElementInfo, FilterManagers } from "./types";
import { registerComponentModules } from "./registerComponentModules";

const customElementInfoByConstructor:Map<Function,CustomElementInfo> = new Map;
const filterManagersByConstructor:Map<Function,FilterManagers> = new Map;

/**
 * コンポーネントのベースとなるクラスを生成します
 * @param componentModule コンポーネントモジュール
 * @returns {typeof HTMLElement} コンポーネントクラス
 */
export const generateComponentClass = (componentModule:ComponentModule):typeof HTMLElement => {
  const getBaseClass = function (module:IModule, baseConstructor:typeof HTMLElement):Constructor<HTMLElement & IComponentBase>  {
    const baseClass = class extends baseConstructor implements IComponentBase {
      #module:IModule = module;
      get module():IModule {
        return this.#module;
      }

      get isQuelComponent():boolean {
        return true;
      }
      #customElementInfo?: CustomElementInfo;
      get customElementInfo(): CustomElementInfo {
        if (typeof this.#customElementInfo === "undefined") {
          this.#customElementInfo = customElementInfoByConstructor.get(this.thisClass) ?? utils.raise(`customElementInfo is not found `);
        }
        return this.#customElementInfo;
      }
      #setCustomElementInfo() {
        const customeElementInfo = customElementInfoByConstructor.get(this.thisClass);
        if (typeof customeElementInfo === "undefined") {
          const lowerTagName =  this.tagName.toLowerCase();
          const isAutonomousCustomElement = lowerTagName.includes("-");
          const customName = this.getAttribute("is");
          const isCostomizedBuiltInElement = customName ? true : false;
          const selectorName = isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
          customElementInfoByConstructor.set(this.thisClass, 
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
          this.#filterManagers = filterManagersByConstructor.get(this.thisClass) ?? utils.raise(`filterManagers is not found for ${this.tagName}`);
        }
        return this.#filterManagers;
      }
      #setFilterManagers() {
        const filterManagers = filterManagersByConstructor.get(this.thisClass);
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
          filterManagersByConstructor.set(this.thisClass, filterManagers);
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

      get element(): HTMLElement {
        return this;
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
    return baseClass;
  };

  const module:IModule = createModule(componentModule);
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

