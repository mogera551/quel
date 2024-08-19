import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { IDependentProps } from "../@types/state";
import { IDotNotationHandler } from "../newDotNotation/types";

interface IBaseStatePartial {
  [AccessorPropertiesSymbol]:Set<string>;
  [DependenciesSymbol]:IDependentProps;
}
export type IBaseState = IDotNotationHandler & IBaseStatePartial;
