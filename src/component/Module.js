import { config } from "../Config.js";
import "../types.js";
import { utils } from "../utils.js";
import { Template } from "./Template.js";

export class Module {
  /** @type {string} */
  #uuid = utils.createUUID();
  get uuid() {
    return this.#uuid;
  }

  /** @type {string} */
  html = "";

  /** @type {string|undefined} */
  css;

  /** @type {HTMLTemplateElement} */
  get template() {
    const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.css, this.uuid, customComponentNames);
  }

  /** @type {ViewModel.constructor} */
  ViewModel = class {};

  /** @type {ComponentModuleConfig} */
  config = {};

  /** @type {ComponentModuleOptions} */
  options = {};

  /** @type {ComponentModuleFilters} */
  filters = {};

  /** @type {Object<string,Module>|undefined} */
  componentModules;

  /** @type {Object<string,Module>|undefined} */
  get componentModulesForRegister() {
    if (this.config.useLocalTagName ?? config.useLocalTagName) {
      // case of useLocalName with true,
      // subcompnents tag name convert to the name with uuid
      if (typeof this.componentModules !== "undefined") {
        /** @type {Object<string,Module>} */
        const componentModules = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules)) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}