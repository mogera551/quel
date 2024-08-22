import { IPropInfo } from "../newDotNotation/types";
import { Handler } from "./Handler";

export class ReadonlyHandler extends Handler {
  #cache = new Map<string,any>();
  _getValue(
    target:object, 
    patternPaths:string[],
    patternElements:string[],
    wildcardIndexes:(number|undefined)[], 
    pathIndex:number, wildcardIndex:number,
    receiver:object, 
  ):any {
    const path = patternPaths[pathIndex];
    if (patternPaths.length > 1 || this.accessorProperties.has(path)) {
      const indexesString = wildcardIndexes.slice(0, wildcardIndex + 1).toString();
      const key = `${path}:${indexesString}`;
      let value = this.#cache.get(key);
      if (typeof value !== "undefined") return value;
      if (this.#cache.has(key)) return undefined;
      value = super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
      this.#cache.set(key, value);
      return value;
    } else {
      return super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
    }
  }

  clearCache():void {
    this.#cache.clear();
  }

}