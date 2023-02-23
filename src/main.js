import "./types.js";
import Component from "./component/Component.js";

export default class Main {
  static #config = {
    prefix: undefined,
    debug: false,
  };
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
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
   * @param {{prefix:string,debug:boolean}}  
   * @returns 
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