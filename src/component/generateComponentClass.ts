import { utils } from "../utils";
import { FilterFuncWithOption, EventFilterFuncWithOption } from "../filter/types";
import { createModule } from "./createModule";
import { config } from "../Config";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { CustomComponent } from "./CustomComponent";
import { DialogComponent } from "./DialogComponent";
import { PopoverComponent } from "./PopoverComponent";
import { Constructor, IComponentBase, IModule, ComponentModule, CustomElementInfo, FilterManagers, IBufferedBindComponent, ICustomComponent } from "./types";
import { registerComponentModules } from "./registerComponentModules";
import { BufferedBindComponent } from "./BufferedBindComponent";

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
      get quelIsQuelComponent():boolean {
        return true;
      }
      #customElementInfo?: CustomElementInfo;
      #setCustomElementInfo() {
        let customeElementInfo = customElementInfoByConstructor.get(this.quelThisClass);
        if (typeof customeElementInfo === "undefined") {
          const lowerTagName =  this.tagName.toLowerCase();
          const isAutonomousCustomElement = lowerTagName.includes("-");
          const customName = this.getAttribute("is");
          const isCostomizedBuiltInElement = customName ? true : false;
          const selectorName = isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
          customeElementInfo = { selectorName, lowerTagName, isAutonomousCustomElement, isCostomizedBuiltInElement };
          customElementInfoByConstructor.set(this.quelThisClass, customeElementInfo);
        }
        this.#customElementInfo = customeElementInfo;
      }

      get quelHtml(): string {
        return this.#module.html;
      }
      set quelHtml(value: string) {
        this.#module.html = value;
      }
      get quelTemplate(): HTMLTemplateElement {
        return this.#module.template;
      }

      get quelCss(): string|undefined {
        return this.#module.css;
      }
      set quelCss(value: string|undefined) {
        this.#module.css = value;
      }
      get quelStyleSheet(): CSSStyleSheet|undefined {
        return this.#module.styleSheet;
      }

      get quelStateClass(): typeof Object {
        return this.#module.State;
      }

      get quelUseShadowRoot():boolean {
        return this.#module.moduleConfig.useShadowRoot ?? config.useShadowRoot;
      }

      get quelUseWebComponent():boolean {
        return this.#module.moduleConfig.useWebComponent ?? config.useWebComponent;
      }

      get quelUseLocalTagName():boolean {
        return this.#module.moduleConfig.useLocalTagName ?? config.useLocalTagName;
      }

      get quelUseKeyed():boolean {
        return this.#module.moduleConfig.useKeyed ?? config.useKeyed;
      }

      get quelUseLocalSelector():boolean {
        return this.#module.moduleConfig.useLocalSelector ?? config.useLocalSelector;
      }

      get quelUseOverscrollBehavior():boolean {
        return this.#module.moduleConfig.useOverscrollBehavior ?? config.useOverscrollBehavior;
      }

      get quelUseInvokeCommands():boolean {
        return this.#module.moduleConfig.useInvokeCommands ?? config.useInvokeCommands;
      }

      get quelLowerTagName():string {
        return this.#customElementInfo?.lowerTagName ?? utils.raise(`lowerTagName is not found for ${this.tagName}`);
      }

      get quelSelectorName():string {
        return this.#customElementInfo?.selectorName ?? utils.raise(`selectorName is not found for ${this.tagName}`);
      }

      // is autonomous custom element 
      get quelIsAutonomousCustomElement():boolean {
        return this.#customElementInfo?.isAutonomousCustomElement ?? utils.raise(`isAutonomousCustomElement is not found for ${this.tagName}`);
      }

      // is costomized built-in element
      get quelIsCostomizedBuiltInElement() {
        return this.#customElementInfo?.isCostomizedBuiltInElement ?? utils.raise(`isCostomizedBuiltInElement is not found for ${this.tagName}`);
      }

      #filterManagers?: FilterManagers;
      #setFilterManagers() {
        let filterManagers = filterManagersByConstructor.get(this.quelThisClass);
        if (typeof filterManagers === "undefined") {
          filterManagers = {
            inputFilterManager: new InputFilterManager,
            outputFilterManager: new OutputFilterManager,
            eventFilterManager: new EventFilterManager,
          };
          for(const [name, filterFunc] of Object.entries(this.#module.filters.input ?? {})) {
            filterManagers.inputFilterManager.registerFilter(name, filterFunc);
          }
          for(const [name, filterFunc] of Object.entries(this.#module.filters.output ?? {})) {
            filterManagers.outputFilterManager.registerFilter(name, filterFunc);
          }
          for(const [name, filterFunc] of Object.entries(this.#module.filters.event ?? {})) {
            filterManagers.eventFilterManager.registerFilter(name, filterFunc);
          }
          filterManagersByConstructor.set(this.quelThisClass, filterManagers);
        }
        this.#filterManagers = filterManagers;
      }

      get quelInputFilterManager(): InputFilterManager {
        return this.#filterManagers?.inputFilterManager ?? utils.raise("inputFilterManager is not found");
      }

      get quelOutputFilterManager(): OutputFilterManager {
        return this.#filterManagers?.outputFilterManager ?? utils.raise("outputFilterManager is not found");
      }

      get quelEventFilterManager(): EventFilterManager {
        return this.#filterManagers?.eventFilterManager ?? utils.raise("eventFilterManager is not found");
      }

      get quelElement(): HTMLElement {
        return this;
      }

      constructor() {
        super();
        this.#setCustomElementInfo();
        this.#setFilterManagers();
      }
      static quelBaseClass: Function = baseConstructor;
      get quelBaseClass():Function {
        return Reflect.get(this.constructor, "quelBaseClass");
      }
      static quelThisClass: Function|undefined;
      get quelThisClass(): Function {
        return Reflect.get(this.constructor, "quelThisClass");
      }
      static _module: IModule = module;
      static get html():string {
        return this._module.html;
      }
      static set html(value:string) {
        this._module.html = value;
      }
      static get css():string|undefined {
        return this._module.css;
      }
      static set css(value:string|undefined) {
        this._module.css = value;
      }
    };
    baseClass.quelThisClass = baseClass;
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
  const extendedComponentClass = PopoverComponent(DialogComponent(BufferedBindComponent(CustomComponent(componentClass))));

  // register component's subcomponents 
  registerComponentModules(module.componentModulesForRegister ?? {});

  return extendedComponentClass;
}

