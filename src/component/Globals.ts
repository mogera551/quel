//import "../types.js";
//import { Symbols } from "../Symbols.js";
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import { BoundByComponentSymbol } from "../@symbols/global";
import { IComponent } from "../@types/component";
import { IGlobalData } from "../@types/global";
import { Handler } from "../dot-notation/Handler";
import { getPropertyNameInfo } from "../dot-notation/PropertyName";
import { GlobalData } from "../global/Data";
//import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

class ComponentGlobalDataHandler extends Handler implements ProxyHandler<IGlobalData> {
  #component:IComponent;

  setOfProps:Set<string> = new Set;

  constructor(component:IComponent) {
    super();
    this.#component = component;
  }

  /**
   * プロパティをバインドする
   */
  bindProperty(prop:string) {
    GlobalData.data[BoundByComponentSymbol](this.#component, prop);
    this.setOfProps.add(prop);
  }

  directGet = (name:string, indexes:number[]) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[GetDirectSymbol](name, indexes);
  }

  directSet = (name:string, indexes:number[], value:any) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[SetDirectSymbol](name, indexes, value);
  }

  /**
   * 
   * @param {any} target 
   * @param {string} prop 
   * @param {Proxy<Handler>} receiver 
   * @returns 
   */
  get(target:Object, prop:PropertyKey, receiver:IGlobalData) {
    if (prop ===  GetDirectSymbol) {
      return this.directGet;
    } else if (prop ===  SetDirectSymbol) {
      return this.directSet;
    }
    if (typeof prop !== "string") return Reflect.get(target, prop, receiver);
    const { patternName, indexes } = getPropertyNameInfo(prop);
    return this.directGet(patternName, indexes as number[]);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:IGlobalData):boolean {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, receiver);
    const { patternName, indexes } = getPropertyNameInfo(prop);
    return this.directSet(patternName, indexes as number[], value);
  }
}

export function createGlobals(component:IComponent):IGlobalData {
  return new Proxy<Object>({}, new ComponentGlobalDataHandler(component)) as IGlobalData;
}