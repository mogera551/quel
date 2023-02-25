import "./types.js";
import Component from "./component/Component.js";
import Filter from "./filter/Filter.js";

export default class Main {
  static #config = {
    prefix: undefined,
    debug: false,
  };
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
   * @returns {Main}
   */
  static components(components) {
    const prefix = this.prefix;
    Object.entries(components).forEach(([name, componentData]) => {
      const componentName = prefix ? (prefix + "-" + name) : name;
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
   * 
   * @param {{prefix:string,debug:boolean}}  
   * @returns {Main}
   */
  static config({ prefix = undefined, debug = false }) {
    this.#config = Object.assign(this.#config, { prefix, debug });
    return this;
  }
  static get debug() {
    return this.#config.debug;
  }
  static get prefix() {
    return this.#config.prefix;
  }
}