import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { IComponent } from "../@types/component";
import { PropertyAccess } from "../newBinding/PropertyAccess";
import { Handler as DotNotationHandler } from "../newDotNotation/Handler";
import { INewLoopContext } from "../newLoopContext/types";
import { utils } from "../utils";
import { getApi } from "./Api";
import { getCallback } from "./Callback";
import { getSpecialProps } from "./SpecialProp";
import { getStateInfo } from "./StateInfo";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [key:PropertyKey]:any
}

export class Handler extends DotNotationHandler implements IStateHandler {
  #component:IComponent;
  #accessorProperties: Set<string>;
  #dependentProps: IDependentProps;
  #objectBySymbol: ObjectBySymbol;
  get accessorProperties():Set<string> {
    return this.#accessorProperties;
  }
  get dependentProps():IDependentProps {
    return this.#dependentProps;
  }
  get component():IComponent {
    return this.#component;
  }
  constructor(component:IComponent) {
    super();
    this.#component = component;
    if (typeof component.baseState === "undefined") utils.raise("baseState is undefined");
    const { accessorProperties, dependentProps } = getStateInfo(component.baseState as IStateProxy); // todo: あとで型を変更
    this.#accessorProperties = accessorProperties;
    this.#dependentProps = dependentProps;
    this.#objectBySymbol = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
  }

  _getValue(
    target:object, 
    patternPaths:string[],
    patternElements:string[],
    wildcardIndexes:(number|undefined)[], 
    pathIndex:number, wildcardIndex:number,
    receiver:object, 
  ):any {
    if (patternPaths.length > 1) {
      const pattern = patternPaths[pathIndex];
      !this.dependentProps.hasDefaultProp(pattern) && this.dependentProps.addDefaultProp(pattern);
    }
    return super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
  }

  #getBySymbol(target:Object, prop:symbol, receiver:IStateProxy):any {
    return this.#objectBySymbol[prop] ?? 
      getCallback(target as Object, receiver, this, prop) ?? 
      getApi(target as Object, receiver, this, prop) ?? 
      super.get(target, prop, receiver);
  }
  #getByString(target:Object, prop:string, receiver:IStateProxy):any {
    return getSpecialProps(target as Object, receiver, this, prop) ?? super.get(target, prop, receiver);
  }

  #getterByType:{[key:string]:(...args:any)=>any} = {
    "symbol": this.#getBySymbol,
    "string": this.#getByString
  }

  get(target:Object, prop:PropertyKey, receiver:IStateProxy):any {
    return this.#getterByType[typeof prop]?.(target, prop, receiver) ?? super.get(target, prop, receiver);
  }

  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void {
    // ToDo: 処理を実装する
  }

  clearCache():void {
  }

  async directlyCallback(loopContext:INewLoopContext, callback:() => Promise<void>):Promise<void> {
  }

  addProcess(process: () => Promise<void>, stateProxy: IStateProxy, indexes: number[]): void {
    // ToDO: 処理を実装する
  }

}