import "./types.js";
import Component from "./component/Component.js";
import "./thread/Thread.js"; // threadの開始

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