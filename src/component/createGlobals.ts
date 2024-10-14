import { GetDirectSymbol, SetDirectSymbol } from "../dotNotation/symbols";
import { BoundByComponentSymbol } from "../global/symbols";
import { GlobalData } from "../global/Data";
import { IGlobalDataProxy } from "../global/types";
import { Handler } from "../dotNotation/Handler";
import { IComponent } from "./types";
import { getPropInfo } from "../dotNotation/getPropInfo";
import { ILoopIndexes } from "../loopContext/types";

type IComponentForGlobalData = Pick<IComponent, "states">;

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

  directGet = (name:string, loopIndexes:ILoopIndexes | undefined) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[GetDirectSymbol](name, loopIndexes);
  }

  directSet = (name:string, loopIndexes:ILoopIndexes | undefined, value:any) => {
    if (!this.setOfProps.has(name)) {
      this.bindProperty(name);
    }
    return GlobalData.data[SetDirectSymbol](name, loopIndexes, value);
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
    const { pattern, wildcardLoopIndexes } = getPropInfo(prop);
    return this.directGet(pattern, wildcardLoopIndexes);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:IGlobalDataProxy):boolean {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, receiver);
    const { pattern, wildcardLoopIndexes } = getPropInfo(prop);
    return this.directSet(pattern, wildcardLoopIndexes, value);
  }
}

/**
 * 
 * @param component グローバルデータへのアクセスを作成するコンポーネント
 * @returns {IGlobalDataProxy} グローバルデータへのアクセス
 */
export function createGlobals(component: IComponentForGlobalData): IGlobalDataProxy {
  return new Proxy<Object>({}, new ComponentGlobalDataHandler(component)) as IGlobalDataProxy;
}