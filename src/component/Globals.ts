import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import { BoundByComponentSymbol } from "../@symbols/global";
import { GlobalData } from "../global/Data";
import { IGlobalDataProxy } from "../@types/global";
import { Handler } from "../dotNotation/Handler";
import { INewComponent } from "../@types/component";
import { getPropInfo } from "../dotNotation/PropInfo";

type IComponentForGlobalData = Pick<INewComponent, "states">;

class ComponentGlobalDataHandler extends Handler implements ProxyHandler<IGlobalDataProxy> {
  #component:IComponentForGlobalData;

  setOfProps:Set<string> = new Set;

  constructor(component:IComponentForGlobalData) {
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
  get(target:Object, prop:PropertyKey, receiver:IGlobalDataProxy) {
    if (prop ===  GetDirectSymbol) {
      return this.directGet;
    } else if (prop === SetDirectSymbol) {
      return this.directSet;
    }
    if (typeof prop !== "string") return Reflect.get(target, prop, receiver);
    const { pattern, wildcardIndexes } = getPropInfo(prop);
    return this.directGet(pattern, wildcardIndexes as number[]);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:IGlobalDataProxy):boolean {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, receiver);
    const { pattern, wildcardIndexes } = getPropInfo(prop);
    return this.directSet(pattern, wildcardIndexes as number[], value);
  }
}

export function createGlobals(component: IComponentForGlobalData):IGlobalDataProxy {
  return new Proxy<Object>({}, new ComponentGlobalDataHandler(component)) as IGlobalDataProxy;
}