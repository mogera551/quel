import { IComponent } from "../@types/component";
import { IGlobalData } from "../@types/global";
import { SetDirectSymbol } from "../@symbols/dotNotation";
import { BoundByComponentSymbol } from "../@symbols/global";
import { NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { Handler } from "../dot-notation/Handler";
import { getPropertyNameInfo } from "../dot-notation/PropertyName";

class GlobalDataHandler extends Handler implements ProxyHandler<IGlobalData> {
  #setOfComponentByProp:Map<string,Set<IComponent>> = new Map;

  /**
   * 
   * @param {any} target 
   * @param {string|Symbol} prop 
   * @param {any} receiver 
   * @returns 
   */
  get(target:any, prop:PropertyKey, receiver:IGlobalData) {
    if (prop === BoundByComponentSymbol) {
      return (component:IComponent, prop:string) => {
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

  set(target:any, prop:PropertyKey, value:any, receiver:IGlobalData) {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, receiver);
    const { name, indexes } = getPropertyNameInfo(prop);
    const result = receiver[SetDirectSymbol](name, indexes as number[], value);
    let setOfComponent = this.#setOfComponentByProp.get(name);
    if (setOfComponent) {
      for(const component of setOfComponent) {
        component.currentState[NotifyForDependentPropsApiSymbol]("$globals." + name, indexes as number[]);
      }
    }
    return result;
  }

}

export class GlobalData {
  static create(data:{[key:string]:any} = {}):IGlobalData {
    return new Proxy<Object>(data, new GlobalDataHandler) as IGlobalData;
  }

  static #data:IGlobalData = this.create();
  static get data():IGlobalData {
    return this.#data;
  }
  static set data(data:Object) {
    this.#data = this.create(data);
  }
}

