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

  html: string = "";

  css?: string;

  get template(): HTMLTemplateElement {
    const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return createComponentTemplate(this.html, this.uuid, customComponentNames);
  }

  get styleSheet():CSSStyleSheet | undefined {
    return this.css ? createStyleSheet(this.css, this.uuid) : undefined;
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