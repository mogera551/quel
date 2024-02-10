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
  html;

  /** @type {string|undefined} */
  css;

  /** @type {HTMLTemplateElement} */
  get template() {
    const customComponentNames = (this.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.css, this.uuid, customComponentNames);
  }

  /** @type {ViewModel.constructor} */
  ViewModel;

  /** @type {HTMLElement.constructor|undefined} */
  extendClass;

  /** @type {string|undefined} */
  extendTag;

  /** @type {boolean|undefined} */
  useWebComponent;

  /** @type {boolean|undefined} */
  useShadowRoot;

  /** @type {boolean|undefined} */
  useLocalTagName;

  /** @type {boolean|undefined} */
  useKeyed;

  /** @type {Object<string,FilterFunc>|undefined} */
  inputFilters;

  /** @type {Object<string,FilterFunc>|undefined} */
  outputFilters;

  /** @type {Object<string,Module>|undefined} */
  componentModules;

  /** @type {Object<string,Module>|undefined} */
  get componentModulesForRegist() {
    if (this.useLocalTagName ?? config.useLocalTagName) {
      if (typeof this.componentModules !== "undefined") {
        const componentModules = {};
        for(const [customElementName, componentModule] of Object.entries(this.componentModules ?? {})) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}