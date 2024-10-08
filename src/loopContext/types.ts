import { IBinding, IBindingTreeNode, IContentBindingsTreeNode } from "../binding/types";

export type INamedLoopContexts = {
  [key: string]: ILoopContext;
}

export interface ILoopContext {
  readonly parentLoopContext?: ILoopContext;
  readonly index: number;
  readonly indexes: number[];
  readonly patternName:string;
  readonly parentBinding:IBindingTreeNode;
  readonly contentBindings: IContentBindingsTreeNode;
  readonly namedLoopContexts: INamedLoopContexts;
  readonly loopTreeNodesByName: {[key: string]: Set<IBinding>};
  readonly loopTreeLoopableNodesByName: {[key: string]: Set<IBinding>};
  find(patternName:string):ILoopContext | undefined;
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
  disposed: boolean;
  readonly parentLoopIndexes: ILoopIndexes | undefined;
  readonly values: number[];
  assignValue({ parentLoopIndexes, value, values }: { 
    parentLoopIndexes: ILoopIndexes | undefined,
    value: number | undefined,
    values: number[] | undefined
  }): void;
  add(index: number): ILoopIndexes;
  dispose(): void;
}

export type INamedLoopIndexes = Map<string, ILoopIndexes>;

export interface INamedLoopIndexesStack {
  stack: INamedLoopIndexes[];
  asyncSetNamedLoopIndexes(namedLoopIndexes: {[key:string]:number[]}, callback: () => Promise<void>): Promise<void>;
  setNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes, callback: () => void): void;
  setSubIndex(parentName: string | undefined, name: string, index: number, callback: () => void): void;
  getLoopIndexes(name: string): ILoopIndexes | undefined;
  getNamedLoopIndexes(): INamedLoopIndexes | undefined;
}
