import { INewBinding, IContentBindings } from "../@types/types";

export interface INewLoopContext {
  readonly parentLoopContext?: INewLoopContext;
  readonly index: number;
  readonly indexes: number[];
  readonly patternName:string;
  find(patternName:string):INewLoopContext | undefined;
}