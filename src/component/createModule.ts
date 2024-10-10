import { utils } from "../utils";
import { config } from "../Config";
import { createComponentTemplate } from "./Template";
import { createStyleSheet } from "./createStyleSheet";
import { IModule, ComponentModuleConfig, ComponentModuleFilters, ComponentModuleOptions, ComponentModule } from "./types";

export class Module implements IModule {
  #uuid:string = utils.createUUID();
  get uuid(): string {
    return this.#uuid;
  }

  #html: string = "";
  get html(): string {
    return this.#html;
  }
  set html(value: string) {
    this.#html = value;
    this.#template = undefined;
  }

  #css?: string;
  get css(): string | undefined {
    return this.#css;
  }
  set css(value: string | undefined) {
    this.#css = value;
    this.#styleSheet = undefined;
  }

  #template?: HTMLTemplateElement;
  get template(): HTMLTemplateElement {
    if (typeof this.#template === "undefined") {
      const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
      this.#template = createComponentTemplate(this.html, this.uuid, customComponentNames);
    }
    return this.#template;
  }

  #styleSheet?: CSSStyleSheet;
  get styleSheet():CSSStyleSheet | undefined {
    if (typeof this.#styleSheet === "undefined") {
      this.#styleSheet = this.css ? createStyleSheet(this.css, this.uuid) : undefined;
    }
    return this.#styleSheet;
  }

  State:typeof Object = class {} as typeof Object;

  config: ComponentModuleConfig = {};

  moduleConfig: ComponentModuleConfig = {};

  options: ComponentModuleOptions = {};

  filters: ComponentModuleFilters = {};

  componentModules?: {[key: string]: IModule};

  get componentModulesForRegister(): {[key:string]: IModule}|undefined {
    if (this.config.useLocalTagName ?? config.useLocalTagName) {
      // case of useLocalName with true,
      // subcompnents tag name convert to the name with uuid
      if (typeof this.componentModules !== "undefined") {
        const componentModules: {[key: string]: IModule} = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules)) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
}

/**
 * コンポーネントモジュールから中間モジュールを生成します。
 * @param componentModule コンポーネントモジュール  
 * @returns {IModule} 中間モジュール
 */
export function createModule(componentModule: ComponentModule): IModule {
  return Object.assign(new Module, componentModule);
}