import { Indexes, IWildcardIndexes } from "./types";

const _pool: IWildcardIndexes[] = [];

/**
 * ワイルドカードインデックスを作成します
 * 部分配列を作成するための情報を持ちます
 * オンデマンドで部分配列を作成します
 * なるべく部分配列を作成しないようにします
 * @param pattern パターン
 * @param wildcardCount ワイルドカード数
 * @param indexes インデックス配列
 */
export class WildcardIndexes implements IWildcardIndexes {
  #baseIndexes: Indexes;
  #indexes?: Indexes;
  wildcardCount: number;
  pattern: string;

  get indexes(): Indexes {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.#baseIndexes.slice(0, this.wildcardCount);
    }
    return this.#indexes;
  }

  constructor(pattern: string, wildcardCount: number, indexes: Indexes) {
    this.pattern = pattern;
    this.wildcardCount = wildcardCount;
    this.#baseIndexes = indexes;
    this.#indexes = (wildcardCount === indexes.length) ? indexes : undefined;
  }

  assignValue(pattern: string, wildcardCount: number, indexes: Indexes) {
    this.pattern = pattern;
    this.wildcardCount = wildcardCount;
    this.#baseIndexes = indexes;
    this.#indexes = (wildcardCount === indexes.length) ? indexes : undefined;
  }
}

/**
 * ワイルドカードインデックスを作成します
 * @param pattern パターン
 * @param wildcardCount ワイルドカード数
 * @param indexes インデックス配列
 * @returns {IWildcardIndexes} ワイルドカードインデックス
 */
export function createWildCardIndexes(
  pattern: string, 
  wildcardCount: number, 
  indexes: Indexes
): IWildcardIndexes {
  if (_pool.length > 0) {
    const wildcardIndexes = _pool.pop() as WildcardIndexes;
    wildcardIndexes.assignValue(pattern, wildcardCount, indexes);
    return wildcardIndexes;
  } else {
    return new WildcardIndexes(pattern, wildcardCount, indexes);
  }
}

export function disposeWildCardIndexes(wildcardIndexes: IWildcardIndexes): void {
  _pool.push(wildcardIndexes);
}