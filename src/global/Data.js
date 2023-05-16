import "../types.js";
import { Symbols } from "../Symbols.js";
import { Handler, PropertyName } from "../../modules/dot-notation/dot-notation.js";

class GlobalDataHandler extends Handler {
  /**
   * @type {Map<string,Set<import("../component/Component.js").Component[]>>}
   */
  #setOfComponentByProp = new Map;
  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} receiver 
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === Symbols.boundByComponent) {
      return (component, prop) => {
        let setOfComponent = this.#setOfComponentByProp.get(prop);
        if (setOfComponent == null) {
          this.#setOfComponentByProp.set(prop, new Set([ component ]));
        } else {
          setOfComponent.add(component);
        }
      }
    }
    return super.get(target, prop, receiver);
  }

  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   * @returns 
   */
  set(target, prop, value, receiver) {
    const { propName, indexes } = PropertyName.parse(prop);
    const result = receiver[Symbols.directlySet](propName.name, indexes, value);
    let setOfComponent = this.#setOfComponentByProp.get(propName.name);
    if (setOfComponent) {
      for(const component of setOfComponent) {
        component.viewModel[Symbols.notifyForDependentProps]("$globals." + propName.name, indexes);
      }
    }
    return result;
  }

}

export class GlobalData {
  /**
   * 
   * @returns 
   */
  static create() {
    return new Proxy({}, new GlobalDataHandler);
  }
  /**
   * @type {Object<string,any>}
   */
  static data = this.create();

}

