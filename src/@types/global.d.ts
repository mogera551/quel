import { BoundByComponentSymbol } from "../@symbols/global";
import { IDotNotationProxy } from "./dotNotation";
import { IComponent } from "../newComponent/types";

interface IGlobalDataProxy extends IDotNotationProxy {
  [BoundByComponentSymbol]:(component:Pick<IComponent,"states">, prop:string)=>void;
};

