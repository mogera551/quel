import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { INewComponent, INewUpdator } from "../component/types";
import { Handler as DotNotationHandler } from "../dotNotation/Handler";
import { INewLoopContext } from "../newLoopContext/types";
import { getApi } from "./Api";
import { getCallback } from "./Callback";
import { getSpecialProps } from "./SpecialProp";
import { getStateInfo } from "./StateInfo";
import { IBaseState, IDependentProps, IStateHandler, IStateProxy } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [key:PropertyKey]:any
}

type IComponentForHandler = Pick<INewComponent, "states" | "updator"> & HTMLElement;

export class Handler extends DotNotationHandler implements IStateHandler {
  #component: IComponentForHandler;
  #accessorProperties: Set<string>;
  #dependentProps: IDependentProps;
  #objectBySymbol: ObjectBySymbol;
  get accessorProperties(): Set<string> {
    return this.#accessorProperties;
  }
  get dependentProps(): IDependentProps {
    return this.#dependentProps;
  }
  get element(): HTMLElement {
    return this.#component;
  }
  get component(): IComponentForHandler {
    return this.#component;
  }
  get updator(): INewUpdator {
    return this.component.updator;
  }
  constructor(component: IComponentForHandler, base: Object) {
    super();
    this.#component = component;
    const { accessorProperties, dependentProps } = getStateInfo(base as IBaseState);
    this.#accessorProperties = accessorProperties;
    this.#dependentProps = dependentProps;
    this.#objectBySymbol = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
    this.#getterByType["symbol"] = (target: Object, prop: symbol, receiver: IStateProxy):any => this.#getBySymbol.apply(this, [target, prop, receiver]);
    this.#getterByType["string"] = (target: Object, prop: string, receiver: IStateProxy):any => this.#getByString.apply(this, [target, prop, receiver]);
  }

  _getValue(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, wildcardIndex: number,
    receiver: object, 
  ):any {
    if (patternPaths.length > 1) {
      const pattern = patternPaths[pathIndex];
      if (!this.dependentProps.hasDefaultProp(pattern)) {
        this.dependentProps.addDefaultProp(pattern);
      }
    }
    return super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
  }

  #getBySymbol(target: Object, prop: symbol, receiver: IStateProxy):any {
    return this.#objectBySymbol[prop] ?? 
      getCallback(target as Object, receiver, this, prop) ?? 
      getApi(target as Object, receiver, this, prop) ?? 
      undefined;
  }
  #getByString(target: Object, prop: string, receiver: IStateProxy):any {
    return getSpecialProps(target, receiver, this, prop) ?? undefined;
  }

  #getterByType:{[key: string]: (...args: any) => any} = {};

  get(target: Object, prop: PropertyKey, receiver: IStateProxy): any {
    return this.#getterByType[typeof prop]?.(target, prop, receiver) ?? super.get(target, prop, receiver);
  }

  clearCache(): void {
  }

  async directlyCallback(loopContext: INewLoopContext, callback:() => Promise<void>): Promise<void> {
  }
}