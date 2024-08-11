import { BoundByComponentSymbol } from "../@symbols/global";
import { IProxy } from "./dotNotation";

interface IGlobalDataPatial {
  [BoundByComponentSymbol]:(component:IComponent, prop:string)=>void;
};

type IGlobalData = IGlobalDataPatial & IProxy & Object;