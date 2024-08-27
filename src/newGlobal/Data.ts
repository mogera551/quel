import { SetDirectSymbol } from "../@symbols/dotNotation";
import { BoundByComponentSymbol } from "../@symbols/global";
import { NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { Handler } from "../newDotNotation/Handler";
import { INewComponent } from "../newComponent/types";
import { IGlobalDataProxy } from "./types";
import { getPropInfo } from "../newDotNotation/PropInfo";

class GlobalDataHandler extends Handler implements ProxyHandler<IGlobalDataProxy> {
  #setOfComponentByProp:Map<string,Set<INewComponent>> = new Map;

  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} receiver 
   * @returns 
   */
  get(target:any, prop:PropertyKey, receiver:IGlobalDataProxy) {
    if (prop === BoundByComponentSymbol) {
      return (component:INewComponent, prop:string) => {
        let setOfComponent = this.#setOfComponentByProp.get(prop);
        if (typeof setOfComponent === "undefined") {
          this.#setOfComponentByProp.set(prop, new Set([ component ]));
        } else {
          setOfComponent.add(component);
        }
      }
    }
    return super.get(target, prop, receiver);
  }

  set(target:any, prop:PropertyKey, value:any, receiver:IGlobalDataProxy) {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, receiver);
    const { pattern, wildcardIndexes } = getPropInfo(prop);
    const result = receiver[SetDirectSymbol](pattern, wildcardIndexes as number[], value);
    let setOfComponent = this.#setOfComponentByProp.get(pattern);
    if (setOfComponent) {
      for(const component of setOfComponent) {
        component.currentState[NotifyForDependentPropsApiSymbol]("$globals." + pattern, wildcardIndexes as number[]);
      }
    }
    return result;
  }

}

export class GlobalData {
  static create(data:{[key:string]:any} = {}):IGlobalDataProxy {
    return new Proxy<Object>(data, new GlobalDataHandler) as IGlobalDataProxy;
  }

  static #data:IGlobalDataProxy = this.create();
  static get data():IGlobalDataProxy {
    return this.#data;
  }
  static set data(data:Object) {
    this.#data = this.create(data);
  }
}

