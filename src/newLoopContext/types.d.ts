import { INewBinding, IContentBindings } from "../newBinding/types";

export interface INewLoopContext {
  parentLoopContext?: INewLoopContext;
  index: number;
  indexes: number[];
  patternName:string;
  clearIndex():void;
}