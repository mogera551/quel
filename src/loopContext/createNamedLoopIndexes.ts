import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { createLoopIndexes } from "./createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexes } from "./types";

export function createNamedLoopIndexesFromPattern(
  pattern: string,
  indexes: number[]
): INamedLoopIndexes {
  const patternInfo = getPatternInfo(pattern);
  const wildcardPaths = patternInfo.wildcardPaths;
  const namedLoopIndexes: INamedLoopIndexes = {};
  if (wildcardPaths.length > 0) {
    for(let wi = wildcardPaths.length - 1, loopIndexes: ILoopIndexes | undefined = createLoopIndexes(indexes); wi >= 0 ; wi--) {
      if (typeof loopIndexes === "undefined") break;
      namedLoopIndexes[wildcardPaths[wi]] = loopIndexes;
      loopIndexes = loopIndexes.parentLoopIndexes;
    }
  }
  return namedLoopIndexes;
}
