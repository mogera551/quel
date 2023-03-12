import Component from "../component/Component.js";
import GlobalData from "../global/Data.js";

class Handler {
  /**
   * @type {Component}
   */
  component;
  /**
   * 
   * @param {Component} component 
   */
  constructor(component) {
    this.component = component;
  }

  /**
   * @type {Set<string>}
   */
  setOfBindParams = new Set;

  boundFromComponent(globalProperty) {
    GlobalData.globalBoundFromComponent(this.component, globalProperty);
    this.setOfBindParams.add(globalProperty);

  }
  get(target, prop, receiver) {
    if (!this.setOfBindParams.has(prop)) {
      this.boundFromComponent(prop);
    }
    return Reflect.get(target, prop, target);
  }

  set(target, prop, value, receiver) {
    if (!this.setOfBindParams.has(prop)) {
      this.boundFromComponent(prop);
    }
    Reflect.set(target, prop, value, target);
    return true;
  }
}

export default class {
  /**
   * 
   * @param {Component} component 
   * @returns 
   */
  static create(component) {
    return new Proxy(GlobalData.data, new Handler(component))
  }

}