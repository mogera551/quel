import "../nop";
import { BoundByComponentSymbol } from "../@symbols/global";
import { IDotNotationProxy } from "../newDotNotation/types";
import { INewComponent } from "../newComponent/types";

export interface IGlobalDataProxy extends IDotNotationProxy {
  [BoundByComponentSymbol]:(component:Pick<INewComponent,"states">, prop:string)=>void;
};

