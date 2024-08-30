import "../nop";
import { BoundByComponentSymbol } from "../@symbols/global";
import { IDotNotationProxy } from "../@types/types";
import { INewComponent } from "../newComponent/types";

export interface IGlobalDataProxy extends IDotNotationProxy {
  [BoundByComponentSymbol]:(component:Pick<INewComponent,"states">, prop:string)=>void;
};

