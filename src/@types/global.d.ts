import { BoundByComponentSymbol } from "../@symbols/global";
import { IDotNotationProxy } from "./dotNotation";
import { INewComponent } from "../newComponent/types";

interface IGlobalDataProxy extends IDotNotationProxy {
  [BoundByComponentSymbol]:(component:Pick<INewComponent,"states">, prop:string)=>void;
};

