import { INewBinding, IContentBindings } from "../newBinding/types";

export interface INewLoopContext {
  readonly parentLoopContext?: INewLoopContext;
  readonly index: number;
  readonly indexes: number[];
  readonly patternName:string;
  clearIndex():void;
  find(patternName:string):INewLoopContext | undefined;
}