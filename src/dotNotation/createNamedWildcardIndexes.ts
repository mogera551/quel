import { createWildCardIndexes, disposeWildCardIndexes } from "./createWildCardIndexes";
import { Indexes, IPatternInfo, IWildcardIndexes, NamedWildcardIndexes } from "./types";

const _pool: NamedWildcardIndexes[] = [];

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
  const namedWildcardIndexes = _pool.pop() ?? new Map<string, IWildcardIndexes>();
  for(let i = 0; i < patternInfo.wildcardPaths.length; i++) {
    const wildcardPath = patternInfo.wildcardPaths[i];
    namedWildcardIndexes.set(wildcardPath, createWildCardIndexes(wildcardPath, i + 1, indexes));
  }
  return namedWildcardIndexes;
}

export function disposeNamedWildcardIndexes(namedWildcardIndexes: NamedWildcardIndexes): void {
  const wildcardIndexesList = namedWildcardIndexes.values();
  for(const wildcardIndexes of wildcardIndexesList) {
    disposeWildCardIndexes(wildcardIndexes);
  }
  namedWildcardIndexes.clear();
  _pool.push(namedWildcardIndexes);
}
