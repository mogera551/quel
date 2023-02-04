import "./types.js";
import Component from "./component/Component.js";

export default class {
  /**
   * 
   * @param {Object<string,UserComponentData>} components 
   */
  static components(components) {
    Object.entries(components).forEach(([name,componentData]) => {
      Component.regist(name, componentData);
    });

  }
}