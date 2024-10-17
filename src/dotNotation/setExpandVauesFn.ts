import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { Index, IPropInfo, SetExpandValuesFn } from "./types";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { setValueWithoutIndexesFn, IHandlerPartialForSetValueWithoutIndexes } from "./setValueWithoutIndexesFn";
import { createLoopIndexesFromArray } from "../loopContext/createLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";

type IHandlerPartial = Pick<Handler, "notifyCallback"|"getNamedLoopIndexesStack">;

export type IHandlerPartialForSetExpandValues = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForGetValue & IHandlerPartialForSetValueWithoutIndexes;

/**
 * ドット記法の"@"プロパティに値をセットする関数を生成します
 * ex) "@aaa.*.bbb.*.ccc" => 値の配列
 * @param handler Proxyハンドラ
 * @returns {SetExpandValuesFn} ドット記法の"@"プロパティに値をセットする関数
 */
export const setExpandValuesFn = (handler: IHandlerPartialForSetExpandValues): SetExpandValuesFn => {
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    propInfo: IPropInfo, 
    value: any, 
    receiver: object
  ) {
    if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
      utils.raise(`wildcard type is invalid`);
    }
    const notifyCallback = handler.notifyCallback;
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

    for(let i = 0; i < length; i++) {
      indexes[lastIndex] = i;
      const parentPropInfo = getPropInfo(propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined"));
      const parentLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, parentPropInfo.wildcardCount - 1));
      const parentAccessor = createStatePropertyAccessor(parentPropInfo.pattern, parentLoopIndexes)
      const parentNamedLoopIndexes = createNamedLoopIndexesFromAccessor(parentAccessor);
      const parentValue = getValue(
        target,
        parentPropInfo.patternPaths,
        parentPropInfo.patternElements,
        parentPropInfo.wildcardPaths,
        parentNamedLoopIndexes,
        parentPropInfo.paths.length - 1,
        parentPropInfo.wildcardCount - 1,
        receiver);
      const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
      const isWildcard = lastElement === "*";
      Reflect.set(
        parentValue, 
        isWildcard ? (
          namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")
        ) : lastElement, Array.isArray(value) ? value[i] : value, receiver);
      if (notifyCallback) {
        notifyCallback(propInfo.pattern, namedLoopIndexes.get(propInfo.pattern));
      }
    }
  }
}
