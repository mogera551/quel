import { config } from "../Config.js";
import { utils } from "../utils.js";
import * as Template from "./Template.js";
import * as StyleSheet from "./StyleSheet.js";
import { IState } from "../state/types.js";
import { ComponentModuleConfig, ComponentModuleFilters, ComponentModuleOptions } from "./types.js";

export class Module {
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

  State:typeof Object|undefined;

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