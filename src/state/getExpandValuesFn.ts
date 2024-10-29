import { utils } from "../utils";
import { getPropInfo } from "../propertyInfo/getPropInfo";
import { Index, IPropInfo } from "../propertyInfo/types";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { createLoopIndexesFromArray } from "../loopContext/createLoopIndexes";
import { GetExpandValuesFn, IStateHandler } from "./types";

type IHandlerPartial = Pick<IStateHandler, "getNamedLoopIndexesStack">;

export type IHandlerPartialForGetExpandValues = IHandlerPartial & IHandlerPartialForGetValue;

/**
 * ドット記法の"@"プロパティから値を展開する関数を生成します
 * ex) "@aaa.*.bbb.*.ccc" => 値の配列
 * @param handler Proxyハンドラ
 * @returns {GetExpandValuesFn} ドット記法の"@"プロパティから値を展開する関数
 */
export const getExpandValuesFn = (handler: IHandlerPartialForGetExpandValues): GetExpandValuesFn => {
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    propInfo: IPropInfo, 
    receiver: object
  ): any[] {
    // ex.
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0] }
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.1.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.*.bbb.1.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.0.bbb.1.ccc", NG 
    if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
      utils.raise(`wildcard type is invalid`);
    }
    const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getExpandValuesFn: namedLoopIndexesStack is undefined");
    const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getExpandValuesFn: namedLoopIndexes is undefined");
    let indexes: Index[] | undefined;
    let lastIndex = undefined;
    if (propInfo.wildcardType === "context") {
      // 一番後ろの*を展開する
      lastIndex = (propInfo.wildcardLoopIndexes?.size ?? 0) - 1;
      indexes = namedLoopIndexes.get(propInfo.pattern)?.values ?? utils.raise(`namedLoopIndexes is undefined`);
      indexes[indexes.length - 1] = undefined;
    } else {
      // partialの場合、後ろから*を探す
      let loopIndexes: Index[] = [];
      const values = propInfo.wildcardLoopIndexes?.values ?? [];
      for(let i = values.length - 1; i >= 0; i--) {
        if (typeof lastIndex === "undefined"  && typeof values[i] === "undefined") {
          lastIndex = i;
        }
        if (typeof loopIndexes === "undefined"  && namedLoopIndexes.has(propInfo.wildcardPaths[i])) {
          loopIndexes = namedLoopIndexes.get(propInfo.wildcardPaths[i])?.values ?? utils.raise(`loopIndexes is undefined`);
        }
        if (typeof lastIndex !== "undefined" && typeof loopIndexes !== "undefined") {
          break;
        }
      }
      indexes = [];
      const wildcardIndexes = propInfo.wildcardLoopIndexes?.values ?? utils.raise(`wildcardIndexes is undefined`);
      for(let i = 0; i < propInfo.wildcardCount; i++) {
        if (i === lastIndex) {
          indexes.push(undefined);
        } else {
          indexes.push(wildcardIndexes[i] ?? loopIndexes[i]);
        }
      }
    }
    if (typeof lastIndex === "undefined") {
      utils.raise(`lastIndex is undefined`);
    }
    const expandWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const expandWildcardPathInfo = getPropInfo(expandWildcardPath);
    const expandWildcardParentPath = expandWildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
    const expandWildcardParentPathInfo = getPropInfo(expandWildcardParentPath);
    const wildcardLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, lastIndex));
    const wildcardAccessor = createStatePropertyAccessor(expandWildcardParentPathInfo.pattern, wildcardLoopIndexes)
    const wildcardNamedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardAccessor);
    const length = getValue(
      target,
      expandWildcardParentPathInfo.patternPaths,
      expandWildcardParentPathInfo.patternElements,
      expandWildcardParentPathInfo.wildcardPaths,
      wildcardNamedLoopIndexes,
      expandWildcardParentPathInfo.paths.length - 1,
      expandWildcardParentPathInfo.wildcardCount - 1,
      receiver).length;
    const values = [];
    for(let i = 0; i < length; i++) {
      indexes[lastIndex] = i;
      const LoopIndexes = createLoopIndexesFromArray(indexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, LoopIndexes)
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      const value = getValue(
        target,
        propInfo.patternPaths,
        propInfo.patternElements,
        propInfo.wildcardPaths,
        namedLoopIndexes,
        propInfo.paths.length - 1,
        propInfo.wildcardCount - 1,
        receiver);
      values.push(value);
    }
    return values;
  }
}
