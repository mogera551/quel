import { Indexes, IWildcardIndexes } from "./types";

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
}

export function createWildCardIndexes(
  pattern: string, 
  wildcardCount: number, 
  indexes: Indexes
): IWildcardIndexes {
  return new WildcardIndexes(pattern, wildcardCount, indexes);
}