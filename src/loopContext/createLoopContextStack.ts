import { utils } from "../utils";
import { ILoopContext, ILoopContextStack, ILoopIndexes, INamedLoopIndexesStack } from "./types";

class LoopContextStack implements ILoopContextStack {
  stack: ILoopContext | undefined;

  async setLoopContext(
    namedLoopIndexesStack: INamedLoopIndexesStack,
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void> {
    if (namedLoopIndexesStack.stack.length > 0) {
      utils.raise("namedLoopIndexesStack is already set.");
    }
    let currentLoopContext = loopContext;
    const namedLoopIndexes: { [key: string]: ILoopIndexes; } = {};
    while (typeof currentLoopContext !== "undefined") {
      const name = currentLoopContext.patternName;
      namedLoopIndexes[name] = currentLoopContext.serialLoopIndexes;
      currentLoopContext = currentLoopContext.parentLoopContext;
    }
    this.stack = loopContext;
    try {
      await namedLoopIndexesStack.asyncSetNamedLoopIndexes(namedLoopIndexes, async () => {
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
