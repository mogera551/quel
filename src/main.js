import "./types.js";
import Component from "./component/Component.js";
import Filter from "./filter/Filter.js";
import GlobalData from "./global/Data.js";
import utils from "./utils.js";
import Prefix from "./loader/Prefix.js";

export default class Main {
  static #config = {
    prefix: undefined,
    debug: false,
  };
  static #prefixes = {
    "DEFAULT": "./"
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
    Object.assign(this.#prefixes, prefixes);
    for(let [ prefix, path ] of Object.entries(prefixes)) {
      Prefix.add(prefix, path);
    }
    
    return this;
  }
  /**
   * @param 
   */
  static async load(...componentNames) {
    for(const componentName of componentNames) {
      const registComponentName = utils.toKebabCase(componentName);
      const [prefix, ...remains] = registComponentName.split("-");
      const realComponentName = remains.join("-");
      const snakeCompoentnName = realComponentName.split("-").join("_");
      const lowerCamelCompoentnName = realComponentName.split("-").map((text, index) => {
        if (typeof text[0] !== "undefined") {
          text = ((index === 0) ? text[0].toLowerCase() : text[0].toUpperCase()) + text.slice(1);
        }
        return text;
      }).join("");
      const upperCamelCompoentnName = lowerCamelCompoentnName[0].toUpperCase() + lowerCamelCompoentnName.slice(1);
      const prefixPath = this.#prefixes[prefix] ?? utils.raise(`unknown prefix ${prefix}`);
      let path = prefixPath;
      path = path.replaceAll("{ComponentName}", upperCamelCompoentnName);
      path = path.replaceAll("{componentName}", lowerCamelCompoentnName);
      path = path.replaceAll("{component_name}", snakeCompoentnName);
      path = path.replaceAll("{component-name}", realComponentName);
      if (path === prefixPath) {
        path += ((path.at(-1) !== "/") ? "/" : "") + lowerCamelCompoentnName + ".js";
      }
      const paths = location.pathname.split("/");
      paths[paths.length - 1] = path;
      const fullPath = location.origin + paths.join("/");
      const componentModule = await import(/* webpackIgnore: true */fullPath);
      Component.regist(registComponentName, componentModule.default);
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
   * @param {{prefix:string,debug:boolean}}  
   * @returns {Main}
   */
  static config({ prefix = undefined, debug = false }) {
    this.#config = Object.assign(this.#config, { prefix, debug });
    return this;
  }
  /**
   * @type {boolean}
   */
  static get debug() {
    return this.#config.debug;
  }
  /**
   * @type {string}
   */
  static get prefix() {
    return this.#config.prefix;
  }
}