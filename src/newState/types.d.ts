import { AccessorPropertiesSymbol, DependenciesSymbol } from "../@symbols/state";
import { IDependentProps } from "../@types/state";
import { IDotNotationHandler } from "../newDotNotation/types";

interface IBaseStatePartial {
  [AccessorPropertiesSymbol]:Set<string>;
  [DependenciesSymbol]:IDependentProps;
}
export type IBaseState = IDotNotationHandler & IBaseStatePartial;

type Dependencies = {
  [key:string]:string[]
}

interface IDependentProps {
  get propsByRefProp():Map<string,Set<string>>;
  hasDefaultProp(prop:string):boolean;
  addDefaultProp(prop:string):void;
  // setDependentProps(props:Dependencies):void;
}
