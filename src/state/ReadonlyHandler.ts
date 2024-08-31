import { IPropInfo } from "../dotNotation/types";
import { utils } from "../utils";
import { Handler } from "./Handler";

export class ReadonlyHandler extends Handler {
  #cache: { [ key: string ]: any } = {};
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
      return this.#cache[key] ?? 
        ((key in this.#cache) ? 
         undefined : 
         (this.#cache[key] = super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver))
        );
    } else {
      return super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
    }
  }

  clearCache():void {
    this.#cache = {};
  }

  set(target:object, prop:string, value:any, receiver:object):boolean {
    utils.raise("ReadonlyHandler: set is not allowed");
  }

}