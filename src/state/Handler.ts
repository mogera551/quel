import { AccessorPropertiesSymbol, DependenciesSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { Handler as DotNotationHandler } from "../dotNotation/Handler";
import { ILoopContext } from "../loopContext/types";
import { getApiMethod } from "./getApiMethod";
import { getCallbackMethod } from "./getCallbackMethod";
import { getSpecialProps } from "./getSpecialProps";
import { getStateInfo } from "./getStateInfo";
import { IBaseState, IDependentProps, IStateHandler, IStateProxy } from "./types";
import { IUpdator } from "../updator/types";
import { GetValueFn } from "../dotNotation/types";
import { getValueByStateHandler } from "./getValueByStateHandler";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [key:PropertyKey]:any
}

type IComponentForHandler = Pick<IComponent, "states" | "updator"> & HTMLElement;

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
  get updator(): IUpdator {
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

  getValue: GetValueFn = getValueByStateHandler(this);

  #getBySymbol(
    target: Object, 
    prop: symbol, 
    receiver: IStateProxy
  ): any {
    return this.#objectBySymbol[prop] ?? 
      getCallbackMethod(target, receiver, this, prop) ?? 
      getApiMethod(target, receiver, this, prop) ?? 
      undefined;
  }

  #getByString(
    target: Object, 
    prop: string, 
    receiver: IStateProxy
  ): any {
    return getSpecialProps(target, receiver, this, prop) ?? undefined;
  }

  #getterByType:{[key: string]: (...args: any) => any} = {};

  get(
    target: Object, 
    prop: PropertyKey, 
    receiver: IStateProxy
  ): any {
    return this.#getterByType[typeof prop]?.(target, prop, receiver) ?? super.get(target, prop, receiver);
  }

  clearCache(): void {
  }

  async directlyCallback(
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void> {
  }
}