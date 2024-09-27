import { Handler } from "../dotNotation/Handler";
import { GetValueFn } from "../dotNotation/types"
import { getValueByStateHandler as _getValueByStateHandler } from "./getValueByStateHandler";
import { IReadonlyStateHandler, IStateHandler } from "./types";

type IHandlerPartial = Pick<Handler & IStateHandler & IReadonlyStateHandler, "accessorProperties"|"dependentProps"|"cache"|"getValue">;

export const getValueByReadonlyStateHandler = (handler: IHandlerPartial): GetValueFn => {
  const getValueByStateHandler = _getValueByStateHandler(handler);
  return function _getValueByReadonlyStateHandler(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, 
    wildcardIndex: number,
    receiver: object
  ) {
    const { accessorProperties, cache } = handler;
    const path = patternPaths[pathIndex];
    if (patternPaths.length > 1 || accessorProperties.has(path)) {
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
      return (value = cache[key]) ?? 
        ((key in cache) ? 
         value : 
         (cache[key] = getValueByStateHandler(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver))
        );
    } else {
      return getValueByStateHandler(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
    }
  
  }
}

