import { utils } from "../utils";
import { Handler } from "./Handler";

export class ReadonlyHandler extends Handler {
  // MapよりObjectのほうが速かった。keyにconstructorやlengthがある場合は、Mapを選択
  #cache: {[key: string]: any} = {};
  
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
      // sliceよりもループの方が速い
      let key = path + ":";
      for(let i = 0; i <= wildcardIndex; i++) {
        key += `${wildcardIndexes[i]},`;
      }
      let value = this.#cache[key];
      return value ?? 
        ((key in this.#cache) ? 
         value : 
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