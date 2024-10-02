import { utils } from "../utils";
import { createNamedLoopIndexesStack } from "./NamedLoopIndexesStack";
import { ILoopContext, ILoopContextStack, INamedLoopIndexes, INamedLoopIndexesStack } from "./types";

class LoopContextStack {
  stack: ILoopContext | undefined;
  //namedLoopIndexesStack: INamedLoopIndexesStack = createNamedLoopIndexesStack();

  async setLoopContext(
    namedLoopIndexesStack: INamedLoopIndexesStack,
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void> {
    if (namedLoopIndexesStack.stack.length > 0) {
      utils.raise("namedLoopIndexesStack is already set.");
    }
    let currentLoopContext = loopContext;
    const namedLoopIndexes: { [key: string]: number[]; } = {};
    while (typeof currentLoopContext !== "undefined") {
      const name = currentLoopContext.patternName;
      namedLoopIndexes[name] = currentLoopContext.indexes;
      currentLoopContext = currentLoopContext.parentLoopContext;
    }
    this.stack = loopContext;
    try {
      await namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, async () => {
        await callback();
      });
    } finally {
      this.stack = undefined;
    }
  }
}

export function createLoopContextStack(): ILoopContextStack {
  return new LoopContextStack();
}
