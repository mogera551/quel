import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { createLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexes } from "./types";

const _pool: INamedLoopIndexes[] = [];

export function createNamedLoopIndexesFromPattern(
  pattern: string | undefined,
  loopIndexes: ILoopIndexes | undefined
): INamedLoopIndexes {
  const namedLoopIndexes: INamedLoopIndexes = _pool.pop() ?? new Map();
  if (typeof pattern === "undefined") return namedLoopIndexes;
  const patternInfo = getPatternInfo(pattern);
  const wildcardPaths = patternInfo.wildcardPaths;
  if (wildcardPaths.length > 0 && typeof loopIndexes !== "undefined") {
    for(let wi = wildcardPaths.length - 1; wi >= 0 ; wi--) {
      if (typeof loopIndexes === "undefined") break;
      namedLoopIndexes.set(wildcardPaths[wi], loopIndexes);
      loopIndexes = loopIndexes.parentLoopIndexes;
    }
  }
  return namedLoopIndexes;
}

export function disposeNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes): void {
  namedLoopIndexes.clear();
  _pool.push(namedLoopIndexes);
}