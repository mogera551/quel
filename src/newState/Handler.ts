import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { Handler as DotNotationHandler } from "../newDotNotation/Handler";
import { IBaseState, IDependentProps } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type MapSymbolToObject = {
  [AccessorPropertiesSymbol]:Set<string>,
  [DependenciesSymbol]:IDependentProps
}

export class Handler extends DotNotationHandler implements ProxyHandler<IBaseState> {
  #accessorProperties: Set<string>;
  #dependentProps: IDependentProps;
  #mapSymbolToObject: MapSymbolToObject;
  get accessorProperties():Set<string> {
    return this.#accessorProperties;
  }
  get dependentProps():IDependentProps {
    return this.#dependentProps;
  }
  constructor(accessorProperties:Set<string>, dependentProps:IDependentProps) {
    super();
    this.#accessorProperties = accessorProperties;
    this.#dependentProps = dependentProps;
    this.#mapSymbolToObject = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
}

  get(target:object, prop:PropertyKey, receiver:IBaseState):any {
    return this.#mapSymbolToObject[prop as keyof MapSymbolToObject] ?? super.get(target, prop, receiver);
  }
}