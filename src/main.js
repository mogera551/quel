import "./types.js";
import Component from "./component/Component.js";
import Filter from "./filter/Filter.js";
import GlobalData from "./global/Data.js";
import utils from "./utils.js";
import Prefix from "./loader/Prefix.js";
import { ComponentNameType } from "./loader/ComponentNameType.js";
import Loader from "./loader/Loader.js";

const DEAFULT_PATH = "./";

export default class Main {
  /**
   * @type {{
   * debug:boolean,
   * defaultComponentNameType:ComponentNameType,
   * defaultComponentPath:string,
   * }}
   */
  static #config = {
    debug: false,
    defaultComponentNameType: ComponentNameType.lowerCamel,
    defaultComponentPath:DEAFULT_PATH,

  };
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
   * @returns {Main}
   */
  static components(components) {
    Object.entries(components).forEach(([name, componentData]) => {
      const componentName = utils.toKebabCase(name);
      Component.regist(componentName, componentData);
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
   * @param {Object<string,string>} prefixes
   */
  static prefixes(prefixes) {
    for(let [ prefix, path ] of Object.entries(prefixes)) {
      Prefix.add(prefix, path);
    }
    
    return this;
  }
  /**
   * @param 
   */
  static async load(...tagNames) {
    for(const tagName of tagNames) {
      await Loader.load(tagName, this.#config.defaultComponentNameType, this.#config.defaultComponentPath);
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
   * defaultComponentNameType:ComponentNameType,
   * defaultComponentPath:string,
   * }}  
   * @returns {Main}
   */
  static config({ 
    defaultComponentNameType = ComponentNameType.lowerCamel,
    defaultComponentPath = DEAFULT_PATH,
    debug = false }) {
    this.#config = Object.assign(this.#config, { debug, defaultComponentNameType, defaultComponentPath });
    return this;
  }
  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
}

export { ComponentNameType } from "./loader/ComponentNameType.js";
export const defaultPath = DEAFULT_PATH;