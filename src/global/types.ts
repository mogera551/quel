import { BoundByComponentSymbol } from "./symbols";
import { IDotNotationProxy } from "../dotNotation/types";
import { IComponent } from "../component/types";

export interface IGlobalDataProxy extends IDotNotationProxy {
  [BoundByComponentSymbol]: (component: Pick<IComponent, "states">, prop: string) => void;
};

