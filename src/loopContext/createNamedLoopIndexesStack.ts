import { utils } from "../utils";
import { createLoopIndexes, disposeLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexes, INamedLoopIndexesStack } from "./types";

class NamedLoopIndexesStack implements INamedLoopIndexesStack {
  stack: INamedLoopIndexes[] = [];

  async asyncSetNamedLoopIndexes(
    namedLoopIndexes: {[key:string]:number[]}, 
    callback: () => Promise<void>
  ): Promise<void> {
    const tempNamedLoopIndexes = new Map(Object.entries(namedLoopIndexes).map(([name, indexes]) => {
      return [name, createLoopIndexes(indexes)]
    }));
    this.stack.push(tempNamedLoopIndexes);
    try {
      await callback();
    } finally {
      const namedLoopIndexes = this.stack.pop();
    }
  }
  
  setNamedLoopIndexes(
    namedLoopIndexes: INamedLoopIndexes, 
    callback: () => void
  ): void {
    this.stack.push(namedLoopIndexes);
    try {
      callback();
    } finally {
      const namedLoopIndexes = this.stack.pop();
    }
  }

  setSubIndex(
    parentName: string | undefined, 
    name: string, 
    index: number, 
    callback: () => void
  ): void {
    const currentNamedLoopIndexes = this.stack[this.stack.length - 1];
    currentNamedLoopIndexes.set(name, 
      (typeof parentName !== "undefined") ? 
      currentNamedLoopIndexes.get(parentName)?.add(index) ?? utils.raise(`NamedLoopIndexesStack.setSubIndex: parentName "${parentName}" is not found.`) :
      createLoopIndexes([index])
    );
    try {
      callback();
    } finally {
      const loopIndexes = currentNamedLoopIndexes.get(name);
      if (typeof loopIndexes !== "undefined") {
        disposeLoopIndexes(loopIndexes, false);
        currentNamedLoopIndexes.delete(name);
      }
    }
  }

  getLoopIndexes(name: string): ILoopIndexes | undefined {
    const currentNamedLoopIndexes = this.stack[this.stack.length - 1];
    return currentNamedLoopIndexes?.get(name);
  }

  getNamedLoopIndexes(): INamedLoopIndexes | undefined {
    return this.stack[this.stack.length - 1];
  }
  
}

export function createNamedLoopIndexesStack(): NamedLoopIndexesStack {
  return new NamedLoopIndexesStack();
}