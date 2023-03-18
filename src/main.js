import "./types.js";
import Component from "./component/Component.js";
import Filter from "./filter/Filter.js";
import GlobalData from "./global/Data.js";
import utils from "./utils.js";
import { componentNameTypes } from "./loader/ComponentNameType.js";
import ComponentsLoader from "./loader/Loader.js";
import FilterLoader from "./filter/Loader.js";

const DEAFULT_PATH = "./";
const DEFAULT_COMPONEN_NAME_TYPE = "lowercamel";

export class Main {
  /**
   * @type {{
   * debug:boolean,
   * loadComponent:boolean,
   * defaultComponentNameType:string,
   * defaultComponentPath:string,
   * customTag:string[],
   * customTagPrefix:Object<string,string>,
   * loadCustomFilter:boolean,
   * customFilterPath:string,
   * customFilter:string[],
   * }}
   */
  static #config = {
    debug: false,
    loadComponent:false,
    defaultComponentNameType: DEFAULT_COMPONEN_NAME_TYPE,
    defaultComponentPath:DEAFULT_PATH,
    customTag:[],
    customTagPrefix:{},
    loadCustomFilter:false,
    customFilterPath:DEAFULT_PATH,
    customFilter:[],
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
   * @param {Object<string,UserComponentData>} components 
   * @returns {Main}
   */
  static componentsData(components) {
    Object.entries(components).forEach(([name, componentData]) => {
      const componentName = utils.toKebabCase(name);
      const componentClass = Component.getClass(componentData)
      customElements.define(componentName, componentClass);
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
   * @param 
   */
  static async load(...tagNames) {
    const {
      loadComponent, defaultComponentNameType, defaultComponentPath, customTag, customTagPrefix,
    } = this.#config;
    if (loadComponent) {
      const componentNameType = componentNameTypes[defaultComponentNameType.toLowerCase()];
      for(const tagName of tagNames) {
        await ComponentsLoader.load(tagName, customTagPrefix, componentNameType, defaultComponentPath);
      }
    }
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
   * loadComponent:boolean,
   * defaultComponentNameType:string,
   * defaultComponentPath:string,
   * customTag:string[],
   * customTagPrefix:Object<string,string>,
   * loadCustomFilter:boolean,
   * customFilterPath:string,
   * customFilter:string[],
   * }}  
   * @returns {Main}
   */
  static config({ 
    debug = false,
    loadComponent = false,
    defaultComponentNameType = DEFAULT_COMPONEN_NAME_TYPE,
    defaultComponentPath = DEAFULT_PATH,
    customTag = [],
    customTagPrefix = {},
    loadCustomFilter = false,
    customFilterPath = DEAFULT_PATH,
    customFilter = [],
  }) {
    this.#config = Object.assign(this.#config, { debug });
    if (loadCustomFilter) {
      this.#config = Object.assign(this.#config, { loadCustomFilter, customFilterPath, customFilter });
    }
    if (loadComponent) {
      this.#config = 
        Object.assign(this.#config, { loadComponent, defaultComponentNameType, defaultComponentPath, customTag, customTagPrefix });
    }
    return this;
  }

  /**
   * 
   */
  static async boot() {
    const {
      loadComponent, defaultComponentNameType, defaultComponentPath, customTag, customTagPrefix,
      loadCustomFilter, customFilterPath, customFilter
    } = this.#config;
    if (loadCustomFilter) {
      for(let filter of customFilter) {
        await FilterLoader.load(filter, customFilterPath);
      }
    }
    if (loadComponent) {
      const componentNameType = componentNameTypes[defaultComponentNameType.toLowerCase()];
      for(let tagName of customTag) {
        await ComponentsLoader.load(tagName, customTagPrefix, componentNameType, defaultComponentPath)
      }
    }
  }
  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
}

export default Main;
