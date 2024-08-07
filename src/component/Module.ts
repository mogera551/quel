import { config } from "../Config";
import { utils } from "../utils";
import * as Template from "./Template";
import * as StyleSheet from "./StyleSheet";
import { ComponentModuleConfig, ComponentModuleFilters, ComponentModuleOptions, IModule } from "./types";

export class Module implements IModule{
  #uuid:string = utils.createUUID();
  get uuid():string {
    return this.#uuid;
  }

  html:string = "";

  css:string|undefined;

  get template():HTMLTemplateElement {
    const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.uuid, customComponentNames);
  }

  get styleSheet():CSSStyleSheet|undefined {
    return this.css ? StyleSheet.create(this.css, this.uuid) : undefined;
  }

  State:typeof Object = class {} as typeof Object;

  config:ComponentModuleConfig = {};

  moduleConfig:ComponentModuleConfig = {};

  options:ComponentModuleOptions = {};

  filters:ComponentModuleFilters = {};

  componentModules:{[key:string]:Module}|undefined;

  get componentModulesForRegister():{[key:string]:Module}|undefined {
    if (this.config.useLocalTagName ?? config.useLocalTagName) {
      // case of useLocalName with true,
      // subcompnents tag name convert to the name with uuid
      if (typeof this.componentModules !== "undefined") {
        const componentModules:{[key:string]:Module} = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules)) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}