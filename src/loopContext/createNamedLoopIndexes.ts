import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { createLoopIndexes, disposeLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexes } from "./types";

const _pool: INamedLoopIndexes[] = [];

export function createNamedLoopIndexesFromPattern(
  pattern: string | undefined,
  indexes: number[]
): INamedLoopIndexes {
  const namedLoopIndexes: INamedLoopIndexes = _pool.pop() ?? new Map();
  if (typeof pattern === "undefined") return namedLoopIndexes;
  const patternInfo = getPatternInfo(pattern);
  const wildcardPaths = patternInfo.wildcardPaths;
  if (wildcardPaths.length > 0) {
    for(let wi = wildcardPaths.length - 1, loopIndexes: ILoopIndexes | undefined = createLoopIndexes(indexes); wi >= 0 ; wi--) {
      if (typeof loopIndexes === "undefined") break;
      namedLoopIndexes.set(wildcardPaths[wi], loopIndexes);
      loopIndexes = loopIndexes.parentLoopIndexes;
    }
  }
  return namedLoopIndexes;
}

export function disposeNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes): void {
  const loopIndexesList = namedLoopIndexes.values();
  for(const loopIndexes of loopIndexesList) {
    disposeLoopIndexes(loopIndexes);
  }
  namedLoopIndexes.clear();
  _pool.push(namedLoopIndexes);
}