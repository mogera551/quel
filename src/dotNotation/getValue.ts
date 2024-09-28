import { utils } from "../utils";
import { Handler } from "./Handler";
import { FindPropertyCallbackFn, GetValueFn, StateCache } from "./types";

type IHandlerPartial = Pick<Handler, "cache"|"findPropertyCallback">;

export const getValue = (handler: IHandlerPartial): GetValueFn => {
  return function _getValue(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, 
    wildcardIndex: number,
    receiver: object, 
    cache: StateCache | undefined = handler.cache,
    findPropertyCallback: FindPropertyCallbackFn | undefined = handler.findPropertyCallback,
    cachable: boolean = typeof handler.cache !== "undefined",
    callable: boolean = patternPaths.length > 1 && typeof handler.findPropertyCallback === "function",
    cacheKeys: string[] | undefined = undefined
  ): any {
    let value, element, isWildcard, path = patternPaths[pathIndex], cacheKey;
    if (typeof cacheKeys === "undefined") {
      cacheKeys = [];
      let tmpKey = "";
      for(let ki = 0, len = wildcardIndexes.length; ki < len; ki++) {
        tmpKey += wildcardIndexes[ki] + ",";
        cacheKeys[ki] = tmpKey;
      }
    }
    if (callable) {
      // @ts-ignore
      findPropertyCallback(path);
    }
    // @ts-ignore
    return cachable ? 
      (/* use cache */ 
        // @ts-ignore
        value = cache[cacheKey = path + ":" + (cacheKeys[wildcardIndex] ?? "")] ?? (
          /* cache value is null or undefined */
          // @ts-ignore
          (cacheKey in cache) ? value : (
            /* no cahce */
            // @ts-ignore
            cache[cacheKey] = (
              (value = Reflect.get(target, path, receiver)) ?? (
                (path in target || pathIndex === 0) ? value : (
                  element = patternElements[pathIndex],
                  isWildcard = element === "*",
                  _getValue(
                    target, 
                    patternPaths,
                    patternElements,
                    wildcardIndexes, 
                    pathIndex - 1, 
                    wildcardIndex - (isWildcard ? 1 : 0), 
                    receiver,
                    cache,
                    findPropertyCallback,
                    cachable,
                    callable,
                    cacheKeys
                  )[isWildcard ? (wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)) : element]
                )
              )
            )
          )
        )
      ) : (
        /* not use cache */
        (value = Reflect.get(target, path, receiver)) ?? (
          (path in target || pathIndex === 0) ? value : (
            element = patternElements[pathIndex],
            isWildcard = element === "*",
            _getValue(
              target, 
              patternPaths,
              patternElements,
              wildcardIndexes, 
              pathIndex - 1, 
              wildcardIndex - (isWildcard ? 1 : 0), 
              receiver,
              cache,
              findPropertyCallback,
              cachable,
              callable,
              cacheKeys
            )[isWildcard ? (wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)) : element]
          )
        )
      );

  }
}
