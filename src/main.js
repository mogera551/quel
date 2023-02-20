import "./types.js";
import Component from "./component/Component.js";
import "./thread/Thread.js"; // threadの開始

export default class {
  static #prefix;
  static #debug = true;
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
   */
  static components(components) {
    const prefix = this.#prefix;
    Object.entries(components).forEach(([name, componentData]) => {
      const componentName = prefix ? `${prefix}-${name}` : name;
      Component.regist(componentName, componentData);
    });
    return this;
  }
  static prefix(prefix) {
    this.#prefix = prefix;
    return this;
  }
  static setDebug(flag) {
    this.#debug = flag;
    return this;
  }
  static getDebug() {
    return this.#debug;
  }
}