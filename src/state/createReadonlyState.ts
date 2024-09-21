import { utils } from "../utils";
import { Handler } from "./Handler";
import { IComponentForHandler, IStateProxy } from "./types";

class ReadonlyHandler extends Handler {
  // MapよりObjectのほうが速かった。keyにconstructorやlengthがある場合は、Mapを選択
  #cache: {[key: string]: any} = {};
  
  _getValue(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, 
    wildcardIndex: number,
    receiver: object, 
  ): any {
    const path = patternPaths[pathIndex];
    if (patternPaths.length > 1 || this.accessorProperties.has(path)) {
      // sliceよりもループで文字列を足していく方が速い
      let key = path + ":";
      for(let i = 0; i <= wildcardIndex; i++) {
        key += wildcardIndexes[i] + ",";
      }
      /**
       * 
       * if ((value = this.#cache[key]) == null) {
       *   if (!(key in this.#cache)) {
       *     value = this.#cache[key] = 
       *       super._getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
       *   }
       * }
       * return value;
       */
      let value;
      return (value = this.#cache[key]) ?? 
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

  set(
    target: object, 
    prop: string, 
    value: any, 
    receiver: object
  ): boolean {
    utils.raise("ReadonlyHandler: set is not allowed");
  }
}

export function createReadonlyState(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new ReadonlyHandler(component, base)) as IStateProxy;
}
