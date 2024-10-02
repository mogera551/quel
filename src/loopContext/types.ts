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

export interface ILoopContextStack {
  setLoopContext(
    namedLoopIndexesStack: INamedLoopIndexesStack,
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void>;
}

export interface ILoopIndexes {
  readonly values: number[];
  add(index: number): ILoopIndexes;
}

export type INamedLoopIndexes = {
  [key: string]: ILoopIndexes;
}

export interface INamedLoopIndexesStack {
  stack: INamedLoopIndexes[];
  setNamedLoopIndexes(namedLoopIndexes: {[key:string]:number[]}, callback: () => Promise<void>): Promise<void>;
  setSubIndex(parentName: string | undefined, name: string, index: number, callback: () => void): void;
  getLoopIndexes(name: string): ILoopIndexes;
}
