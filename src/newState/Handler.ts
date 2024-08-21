import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { IComponent } from "../@types/component";
import { Handler as DotNotationHandler } from "../newDotNotation/Handler";
import { utils } from "../utils";
import { getStateInfo } from "./StateInfo";
import { IBaseState, IDependentProps } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * アクセサプロパティと依存プロパティを持つ
 */

type ObjectBySymbol = {
  [AccessorPropertiesSymbol]:Set<string>,
  [DependenciesSymbol]:IDependentProps
}

export class Handler extends DotNotationHandler implements ProxyHandler<IBaseState> {
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
    const { accessorProperties, dependentProps } = getStateInfo(component.baseState as IBaseState); // todo: あとで型を変更
    this.#accessorProperties = accessorProperties;
    this.#dependentProps = dependentProps;
    this.#objectBySymbol = {
      [AccessorPropertiesSymbol]: this.#accessorProperties,
      [DependenciesSymbol]: this.#dependentProps
    };
  }

  get(target:object, prop:PropertyKey, receiver:IBaseState):any {
    return this.#objectBySymbol[prop as keyof ObjectBySymbol] ?? super.get(target, prop, receiver);
  }
}