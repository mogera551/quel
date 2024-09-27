import { createWildCardIndexes } from "./createWildCardIndexes";
import { Indexes, IPatternInfo, NamedWildcardIndexes } from "./types";

export function createNamedWildcardIndexes(
  patternInfo: IPatternInfo,
  indexes: Indexes
): NamedWildcardIndexes {
  const namedWildcardIndexes: NamedWildcardIndexes = {};
  for(let i = 0; i < patternInfo.wildcardPaths.length; i++) {
    const wildcardPath = patternInfo.wildcardPaths[i];
    namedWildcardIndexes[wildcardPath] = createWildCardIndexes(wildcardPath, i + 1, indexes);
  }
  return namedWildcardIndexes;
}
