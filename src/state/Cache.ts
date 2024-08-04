
type CacheStore = Map<string,Map<string,any>>

export class StateCache {
  #valueByIndexesStringByPatternName:CacheStore = new Map();

  get(patternName:string, indexesString:string):any {
    return this.#valueByIndexesStringByPatternName.get(patternName)?.get(indexesString) ?? undefined;
  }

  has(patternName:string, indexesString:string):any {
    return this.#valueByIndexesStringByPatternName.get(patternName)?.has(indexesString) ?? false;
  }

  set(patternName:string, indexesString:string, value:any):any {
    this.#valueByIndexesStringByPatternName.get(patternName)?.set(indexesString, value) ?? 
      this.#valueByIndexesStringByPatternName.set(patternName, new Map([[indexesString, value]]));
    return value;
  }

  clear() {
    this.#valueByIndexesStringByPatternName.clear();
  }
}