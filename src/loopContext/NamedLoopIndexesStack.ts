import { utils } from "../utils";
import { createLoopIndexes } from "./LoopIndexes";
import { ILoopIndexes, INamedLoopIndexes, INamedLoopIndexesStack } from "./types";

class NamedLoopIndexesStack implements INamedLoopIndexesStack {
  stack: INamedLoopIndexes[] = [];

  async asyncSetNamedLoopIndexes(
    namedLoopIndexes: {[key:string]:number[]}, 
    callback: () => Promise<void>
  ): Promise<void> {
    const tempNamedLoopIndexes = Object.fromEntries(Object.entries(namedLoopIndexes).map(([name, indexes]) => {
      return [name, createLoopIndexes(indexes)]
    }));
    this.stack.push(tempNamedLoopIndexes);
    try {
      await callback();
    } finally {
      this.stack.pop();
    }
  }
  
  setNamedLoopIndexes(
    namedLoopIndexes: {[key:string]:number[]}, 
    callback: () => void
  ): void {
    const tempNamedLoopIndexes = Object.fromEntries(Object.entries(namedLoopIndexes).map(([name, indexes]) => {
      return [name, createLoopIndexes(indexes)]
    }));
    this.stack.push(tempNamedLoopIndexes);
    try {
      callback();
    } finally {
      this.stack.pop();
    }
  }

  setSubIndex(
    parentName: string | undefined, 
    name: string, 
    index: number, 
    callback: () => void
  ): void {
    const currentNamedLoopIndexes = this.stack[this.stack.length - 1];
    currentNamedLoopIndexes[name] = 
      (typeof parentName !== "undefined") ? 
      currentNamedLoopIndexes[parentName]?.add(index) ?? utils.raise(`NamedLoopIndexesStack.setSubIndex: parentName "${parentName}" is not found.`) :
      currentNamedLoopIndexes[name] = createLoopIndexes([index]);
    try {
      callback();
    } finally {
      delete currentNamedLoopIndexes[name];
    }
  }

  getLoopIndexes(name: string): ILoopIndexes | undefined {
    const currentNamedLoopIndexes = this.stack[this.stack.length - 1];
    return currentNamedLoopIndexes?.[name];
  }

  getNamedLoopIndexes(): INamedLoopIndexes | undefined {
    return this.stack[this.stack.length - 1];
  }
  
}

export function createNamedLoopIndexesStack(): NamedLoopIndexesStack {
  return new NamedLoopIndexesStack();
}