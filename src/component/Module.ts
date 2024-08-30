import { utils } from "../utils";
import { config } from "../Config";
import * as Template from "./Template";
import * as StyleSheet from "./StyleSheet";
import { INewModule, NewComponentModuleConfig, NewComponentModuleFilters, NewComponentModuleOptions } from "../@types/types";

export class Module implements INewModule {
  #uuid:string = utils.createUUID();
  get uuid(): string {
    return this.#uuid;
  }

  html: string = "";

  css?: string;

  get template(): HTMLTemplateElement {
    const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.uuid, customComponentNames);
  }

  get styleSheet():CSSStyleSheet | undefined {
    return this.css ? StyleSheet.create(this.css, this.uuid) : undefined;
  }

  State:typeof Object = class {} as typeof Object;

  config: NewComponentModuleConfig = {};

  moduleConfig: NewComponentModuleConfig = {};

  options: NewComponentModuleOptions = {};

  filters: NewComponentModuleFilters = {};

  componentModules?: {[key: string]: INewModule};

  get componentModulesForRegister(): {[key:string]: INewModule}|undefined {
    if (this.config.useLocalTagName ?? config.useLocalTagName) {
      // case of useLocalName with true,
      // subcompnents tag name convert to the name with uuid
      if (typeof this.componentModules !== "undefined") {
        const componentModules: {[key: string]: INewModule} = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules)) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}