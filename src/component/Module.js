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

  /** @type {string} */
  css;

  /** @type {HTMLTemplateElement} */
  get template() {
    const customComponentNames = this.useTagNamespace ? Object.keys(this.componentModules ?? {}) : [];
    return Template.create(this.html, this.css, this.uuid, customComponentNames);
  }

  /** @type {ViewModel.constructor} */
  ViewModel;

  /** @type {HTMLElement.constructor} */
  extendClass;

  /** @type {string} */
  extendTag;

  /** @type {boolean} */
  usePseudo = false;

  /** @type {boolean} */
  useShadowRoot = false;

  /** @type {boolean} */
  useTagNamespace = true;

  /** @type {boolean|undefined} */
  useKeyed;

  /** @type {Object<string,FilterFunc>} */
  inputFilters;

  /** @type {Object<string,FilterFunc>} */
  outputFilters;

  /** @type {Object<string,Module>} */
  componentModules;

  /** @type {Object<string,Module>} */
  get componentModulesForRegist() {
    if (this.useTagNamespace) {
      const componentModules = {};
      if (typeof this.componentModules !== "undefined") {
        for(const [customElementName, componentModule] of Object.entries(this.componentModules ?? {})) {
          componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
        }
        return componentModules;
      }
    }
    return this.componentModules;
  }
  
}