import { utils } from "../utils";
import { Handler } from "./Handler";
import { GetValueFn } from "./types";

type IHandlerPartial = Pick<Handler, "getValue">;

export const getValue = (handler: IHandlerPartial): GetValueFn => 
  function (
  target: object, 
  patternPaths: string[],
  patternElements: string[],
  wildcardIndexes: (number|undefined)[], 
  pathIndex: number, 
  wildcardIndex: number,
  receiver: object, 
): any {
  let value, element, isWildcard, path = patternPaths[pathIndex];
  return (value = Reflect.get(target, path, receiver)) ?? (
    (path in target || pathIndex === 0) ? value : (
      element = patternElements[pathIndex],
      isWildcard = element === "*",
      handler.getValue(
        target, 
        patternPaths,
        patternElements,
        wildcardIndexes, 
        pathIndex - 1, 
        wildcardIndex - (isWildcard ? 1 : 0), 
        receiver
      )[isWildcard ? (wildcardIndexes[wildcardIndex] ?? utils.raise(`wildcard is undefined`)) : element]
    )
  );
}
