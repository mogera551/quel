import { IBindingTreeNode, IContentBindingsTreeNode } from "../binding/types";

export interface ILoopContext {
  readonly parentLoopContext?: ILoopContext;
  readonly index: number;
  readonly indexes: number[];
  readonly patternName:string;
  readonly parentBinding:IBindingTreeNode;
  readonly contentBindings: IContentBindingsTreeNode;
  find(patternName:string):ILoopContext | undefined;
}