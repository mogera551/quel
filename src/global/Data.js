import { SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS, SYM_CALL_BIND_DATA, SYM_CALL_BIND_PROPERTY } from "../viewModel/Symbols.js";
import Component from "../component/Component.js";

class Handler {
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    GlobalData.binds
    .filter(bind => prop === bind.globalProperty)
    .forEach(bind => {
      const [dataProp, nameProp] = bind.componentProperty.split(".");
      bind.component.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$data.${nameProp}`, []);
    })
    return true;
  }
}

export default class GlobalData {
  /**
   * @type {{globalProperty:string,component:Component,componentProperty:string}[]}
   */
  static binds = [];
  /**
   * 
   * @param {Component} component 
   */
  static boundFromComponent(component) {
    component.data[SYM_CALL_BIND_DATA](this.data);
  }
  /**
   * 
   * @param {string} globalProperty 
   * @param {Component} component 
   * @param {string} componentProperty 
   */
  static boundPropertyFromComponent(globalProperty, component, componentProperty) {
    this.binds.push({ globalProperty, component, componentProperty });
    component.data[SYM_CALL_BIND_PROPERTY](componentProperty, globalProperty);
  }
  /**
   * 
   * @returns 
   */
  static create() {
    return new Proxy({}, new Handler);
  }
  /**
   * @type {Object<string,any>}
   */
  static data = this.create();

}

