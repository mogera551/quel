
import { AccessorPropertiesSymbol, DependenciesSymbol } from "./Const";
import { Handler } from "../dot-notation/Handler";
import { DependentProps } from "./DependentProps";

export class StateBaseHandler extends Handler  {
  #accessorProperties:Set<string>;
  get accessorProperties(): Set<string> {
    return this.#accessorProperties;
  }

  #dependencies:DependentProps;
  get dependencies(): DependentProps {
    return this.#dependencies;
  }

  constructor(accessorProperties: Set<string>, dependencies: DependentProps) {
    super();
    this.#accessorProperties = accessorProperties;
    this.#dependencies = dependencies;
  }

  get(target: State, prop: PropertyKey, receiver: any): any {
    if (prop === AccessorPropertiesSymbol) {
      return this.#accessorProperties;
    } else if (prop === DependenciesSymbol) {
      return this.#dependencies;
    }
    return Reflect.get(target, prop, receiver);
  }

  ownKeys(target: State): (string|symbol)[] {
    return Reflect.ownKeys(target).concat([
      AccessorPropertiesSymbol, 
      DependenciesSymbol
    ]);
  }

  has(target: State, prop: PropertyKey): boolean {
    return Reflect.has(target, prop) || prop === AccessorPropertiesSymbol || prop === DependenciesSymbol;
  }

}