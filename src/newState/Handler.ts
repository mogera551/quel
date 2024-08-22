import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { IComponent } from "../@types/component";
import { ILoopContext } from "../@types/loopContext";
import { PropertyAccess } from "../binding/PropertyAccess";
import { Handler as DotNotationHandler } from "../newDotNotation/Handler";
import { utils } from "../utils";
import { Api } from "./Api";
import { Callback } from "./Callback";
import { getStateInfo } from "./StateInfo";
import { IDependentProps, IStateHandler, IStateProxy } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [AccessorPropertiesSymbol]:Set<string>,
  [DependenciesSymbol]:IDependentProps
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

  get(target:Object, prop:PropertyKey, receiver:IStateProxy):any {
    if (typeof prop === "symbol") {
      const object = this.#objectBySymbol[prop as keyof ObjectBySymbol];
      if (typeof object !== "undefined") return object;
      const supportCallbackSymbol = Callback.getSupportSymbol(prop);
      if (typeof supportCallbackSymbol !== "undefined") {
        return Callback.get(target, receiver, this, supportCallbackSymbol);
      }
      const supportApiSymbol = Api.getSupportSymbol(prop);
      if (typeof supportApiSymbol !== "undefined") {
        return Api.get(target, receiver, this, supportApiSymbol);
      }
    }
    return super.get(target, prop, receiver);
  }

  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void {

  }
  clearCache():void {

  }
  directlyCallback(loopContext:ILoopContext, callback:() => void):void {

  }
  addProcess(process: () => Promise<void>, stateProxy: IStateProxy, indexes: number[]): void {
  }

}