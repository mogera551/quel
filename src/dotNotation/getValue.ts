import { utils } from "../utils";
import { Handler } from "./Handler";
import { FindPropertyCallbackFn, GetValueFn, StateCache } from "./types";

type IHandlerPartial = Pick<Handler, "getValue"|"cache"|"findPropertyCallback">;

export const getValue = (handler: IHandlerPartial): GetValueFn => {
  return function (
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, 
    wildcardIndex: number,
    receiver: object, 
  ): any {
    const cache = handler.cache;
    const findPropertyCallback = handler.findPropertyCallback;
    const cachable = typeof cache !== "undefined";
    const isPrimitive = patternPaths.length === 1;
    const callable = !isPrimitive && typeof findPropertyCallback === "function";
    const cacheKeys: string[] = [];
    let tmpKey = "";
    for(let ki = 0, len = wildcardIndexes.length; ki < len; ki++) {
      tmpKey += wildcardIndexes[ki] + ",";
      cacheKeys[ki] = tmpKey;
    }
    const _valueRecursive = (
      pathIndex: number, 
      wildcardIndex: number,
    ): any => {
      let cacheKey, value, path = patternPaths[pathIndex];
      if (callable) {
        findPropertyCallback(path);
      }
      return cachable ? (value = cache[cacheKey = path + ":" + (cacheKeys[wildcardIndex] ?? "") ]) ?? (
        (cacheKey in cache) ? value :
        (cache[cacheKey] = (value = Reflect.get(target, path, receiver)) ?? (
          (pathIndex === 0 || path in target) ? value : (
            patternElements[pathIndex] !== "*" ? 
            _valueRecursive(pathIndex - 1, wildcardIndex)[patternElements[pathIndex]] :
            _valueRecursive(pathIndex - 1, wildcardIndex - 1)[wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)]
          )
        ))
      ) : ((value = Reflect.get(target, path, receiver)) ?? (
        (pathIndex === 0 || path in target) ? value : (
          patternElements[pathIndex] !== "*" ? 
          _valueRecursive(pathIndex - 1, wildcardIndex)[patternElements[pathIndex]] :
          _valueRecursive(pathIndex - 1, wildcardIndex - 1)[wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)]
        )
      ));
    }
    return _valueRecursive(pathIndex, wildcardIndex);
  }
}
 