import { NotifyData } from "../thread/Notifier.js";
import { SYM_GET_DEPENDENT_MAP } from "../viewModel/Symbols.js";
import Component from "./Component.js";

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
  get(target, prop, receiver) {
    console.log("get", prop);
    return Reflect.get(target, prop, receiver);
  }

  set(target, prop, value, receiver) {
    console.log("set", prop);
    const { component } = this;
    Reflect.set(target, prop, value, receiver);
    const dependentMap = component.viewModel[SYM_GET_DEPENDENT_MAP];
    const getDependentProps = (name) => 
      (dependentMap.get(name) ?? []).flatMap(name => [name].concat(getDependentProps(name)));
    const dependentProps = new Set(getDependentProps(`$data.${prop}`));
    dependentProps.forEach(dependentProp => {
      component.updateSlot.addNotify(new NotifyData(component, dependentProp, []));
    });
    return true;
  }
}

/**
 * 
 * @param {Component} component 
 * @returns 
 */
export default function createData(component) {
  return new Proxy({}, new Handler(component));
}