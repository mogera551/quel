import "./types.js";
import { ComponentClassGenerator } from "./component/Component.js";
import { Filter } from "./filter/Filter.js";
import { GlobalData } from "./global/Data.js";
import  { utils } from "./utils.js";

export class Main {
  /**
   * @type {{
   * debug:boolean,
   * }}
   */
  static #config = {
    debug: false,
  };
  /**
   * @typedef {class<HTMLElement>} ComponentClass
   */
  /**
   * 
   * @param {Object<string,ComponentClass>} components 
   * @returns {Main}
   */
  static components(components) {
    Object.entries(components).forEach(([name, componentClass]) => {
      const componentName = utils.toKebabCase(name);
      customElements.define(componentName, componentClass);
    });
    return this;
  }
  /**
   * 
   * @param {string} customElementName 
   * @param {UserComponentModule} componentModule 
   */
  static registComponentModule(customElementName, componentModule) {
    const customElementKebabName = utils.toKebabCase(customElementName);
    const componentClass = ComponentClassGenerator.generate(componentModule);
    if (componentModule.extendTag) {
      customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
    } else if (typeof componentModule?.extendClass === "undefined") {
      customElements.define(customElementKebabName, componentClass);
    } else {
      utils.raise("extendTag should be set");
    }
  }
  /**
   * 
   * @param {Object<string,UserComponentModule>} components 
   * @returns {Main}
   */
  static componentModules(components) {
    Object.entries(components).forEach(([name, componentModule]) => {
      this.registComponentModule(name, componentModule);
    });
    return this;
  }
  /**
   * 
   * @param {Object<string,UserFilterData>} filters 
   * @returns {Main}
   */
  static filters(filters) {
    Object.entries(filters).forEach(([name, filterData]) => {
      const { input, output } = filterData;
      Filter.regist(name, output, input);
    });
    return this;
  }

  /**
   * 
   * @param {Object<string,any>} data 
   */
  static globals(data) {
    Object.assign(GlobalData.data, data);
  }
  /**
   * 
   * @param {{
   * debug:boolean,
   * }}  
   * @returns {Main}
   */
  static config({ 
    debug = false,
  }) {
    this.#config = Object.assign(this.#config, { debug });
    return this;
  }

  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
}

export default Main;
