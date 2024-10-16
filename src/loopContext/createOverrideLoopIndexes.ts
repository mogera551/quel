import { utils } from "../utils";
import { createLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes } from "./types";

export function createOverrideLoopIndexes(
  baseIndexes: ILoopIndexes,
  overrideIndexes: ILoopIndexes
): ILoopIndexes {
  let loopIndexes = undefined;
  const iteratorBase = baseIndexes.forward();
  const iteratorOverride = overrideIndexes.forward();
  while(true) {
    const baseIndex = iteratorBase.next();
    const overrideIndex = iteratorOverride.next();
    if (baseIndex.done || overrideIndex.done) break;
    loopIndexes = createLoopIndexes(loopIndexes, overrideIndex.value ?? baseIndex.value);
  }
  return loopIndexes ?? utils.raise(`createOverrideLoopIndexes: loopIndexes is undefined.`);
}