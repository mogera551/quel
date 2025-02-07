import { createLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexes, INamedLoopIndexesStack } from "./types";

class NamedLoopIndexesStack implements INamedLoopIndexesStack {
  stack: INamedLoopIndexes[] = [];

  get lastNamedLoopIndexes(): INamedLoopIndexes {
    return this.stack[this.stack.length - 1];
  }

  async asyncSetNamedLoopIndexes(
    namedLoopIndexes: {[key:string]:ILoopIndexes}, 
    callback: () => Promise<void>
  ): Promise<void> {
    const tempNamedLoopIndexes = new Map(Object.entries(namedLoopIndexes));
    this.stack.push(tempNamedLoopIndexes);
    try {
      return await callback();
    } finally {
      this.stack.pop();
    }
  }
  
  setNamedLoopIndexes(
    namedLoopIndexes: INamedLoopIndexes, 
    callback: () => any
  ): any {
    this.stack.push(namedLoopIndexes);
    try {
      return callback();
    } finally {
      this.stack.pop();
    }
  }

  setSubIndex(
    parentName: string | undefined, 
    name: string, 
    index: number, 
    callback: () => any
  ): any {
    const currentNamedLoopIndexes = this.lastNamedLoopIndexes;
    currentNamedLoopIndexes?.set(name, 
      currentNamedLoopIndexes?.get(parentName ?? "")?.add(index) ?? createLoopIndexes(undefined, index)
    );
    try {
      return callback();
    } finally {
      currentNamedLoopIndexes?.delete(name);
    }
  }

  getLoopIndexes(name: string): ILoopIndexes | undefined {
    const currentNamedLoopIndexes = this.lastNamedLoopIndexes;
    return currentNamedLoopIndexes?.get(name);
  }

}

export function createNamedLoopIndexesStack(): NamedLoopIndexesStack {
  return new NamedLoopIndexesStack();
}