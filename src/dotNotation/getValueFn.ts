import { INamedLoopIndexes } from "../loopContext/types";
import { utils } from "../utils";
import { Handler } from "./Handler";
import { FindPropertyCallbackFn, GetValueFn, StateCache } from "./types";

type IHandlerPartial = Pick<Handler, "cache"|"findPropertyCallback">;

export type IHandlerPartialForGetValue = IHandlerPartial;

/**
 * ドット記法のプロパティから値を取得する関数を生成します
 * @param handler Proxyハンドラ
 * @returns {GetValueFn} ドット記法のプロパティから値を取得する関数
 */
export const getValueFn = (handler: IHandlerPartialForGetValue): GetValueFn => {
  return function _getValue(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardPaths: string[],
    namedLoopIndexes: INamedLoopIndexes,
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
    if (callable) {
      // @ts-ignore
      findPropertyCallback(path);
    }
    const wildcardLoopIndexes = namedLoopIndexes.get(wildcardPaths[wildcardIndex]);
    // @ts-ignore
    return cachable ? 
      (/* use cache */ 
        // @ts-ignore
        value = cache[cacheKey = path + ":" + (wildcardLoopIndexes?.toString() ?? "")] ?? (
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
                    wildcardPaths,
                    namedLoopIndexes, 
                    pathIndex - 1, 
                    wildcardIndex - (isWildcard ? 1 : 0), 
                    receiver,
                    cache,
                    findPropertyCallback,
                    cachable,
                    callable,
                    cacheKeys
                  )[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element]
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
              wildcardPaths,
              namedLoopIndexes, 
              pathIndex - 1, 
              wildcardIndex - (isWildcard ? 1 : 0), 
              receiver,
              cache,
              findPropertyCallback,
              cachable,
              callable,
              cacheKeys
            )[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element]
          )
        )
      );

  }
}
