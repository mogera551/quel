import { createWildCardIndexes } from "./createWildCardIndexes";
import { Indexes, IPatternInfo, NamedWildcardIndexes } from "./types";

/**
 * パターン情報を元に名前付きワイルドカードインデックスを作成します
 * ex) patternInfo "aaa.*.bbb.*.ccc"、 indexes が [1, 2] の場合、
 *     { "aaa.*" : [1], "aaa.*.bbb.*": [1, 2] }
 * @param patternInfo パターン情報
 * @param indexes インデックス配列
 * @returns {NamedWildcardIndexes} 名前付きワイルドカードインデックス
 */
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
