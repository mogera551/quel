import { IBinding, IBindingTreeNode, IContentBindingsTreeNode } from "../binding/types";
import { Index } from "../dotNotation/types";

export type INamedLoopContexts = {
  [key: string]: ILoopContext;
}

export interface ILoopContext {
  readonly contentBindings: IContentBindingsTreeNode;
  readonly patternName:string;
  readonly parentPatternName:string | undefined;
  readonly parentNamedLoopContext: ILoopContext | undefined
  readonly parentLoopContext: ILoopContext | undefined;
  readonly index: number;
  readonly namedLoopIndexes: ILoopIndexes;
  readonly loopIndexes: ILoopIndexes;
  readonly namedLoopContexts: INamedLoopContexts;
  readonly loopTreeNodesByName: {[key: string]: Set<IBinding>};
  readonly loopTreeLoopableNodesByName: {[key: string]: Set<IBinding>};
  dispose():void;
}

export interface ILoopContextStack {
  setLoopContext(
    namedLoopIndexesStack: INamedLoopIndexesStack,
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void>;
}

export interface ILoopIndexes {
  readonly parentLoopIndexes: ILoopIndexes | undefined;
  readonly value: Index;
  readonly values: Index[];
  readonly index: number;
  readonly size: number;
  add(value: Index): ILoopIndexes;
  backward(): Generator<Index>;
  forward(): Generator<Index>;
  toString(): string;
  truncate(length: number): ILoopIndexes | undefined;
  at(index: number): Index;
}

export type INamedLoopIndexes = Map<string, ILoopIndexes>;

export interface INamedLoopIndexesStack {
  stack: INamedLoopIndexes[];
  readonly lastNamedLoopIndexes: INamedLoopIndexes | undefined;
  asyncSetNamedLoopIndexes(namedLoopIndexes: {[key:string]:ILoopIndexes}, callback: () => Promise<void>): Promise<void>;
  setNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes, callback: () => any): any;
  setSubIndex(parentName: string | undefined, name: string, index: number, callback: () => any): any;
  getLoopIndexes(name: string): ILoopIndexes | undefined;
}
