import { IDotNotationHandler, IPropInfo, SetValueWithIndexesFn } from "./types";
import { utils } from "../utils";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { ILoopIndexes } from "../loopContext/types";

type IHandlerPartial = Pick<IDotNotationHandler, "notifyCallback">;

export type IHandlerPartialForSetValueWithIndexes = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForGetValue;

/**
 * ドット記法のプロパティとインデックスを指定して値を取得する関数を生成します
 * setValueWithoutIndexesFnから呼び出されることを想定しています
 * @param handler Proxyハンドラ
 * @returns {SetValueWithIndexesFn} ドット記法のプロパティとインデックスを指定して値を取得する関数
 */
export const setValueWithIndexesFn = (handler: IHandlerPartialForSetValueWithIndexes): SetValueWithIndexesFn => {
  const withIndexes = withIndexesFn(handler);
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    propInfo: IPropInfo, 
    loopIndexes: ILoopIndexes | undefined, 
    value: any, 
    receiver: object
  ): boolean {
    const notifyCallback = handler.notifyCallback;
    const callable = (typeof notifyCallback === "function");
    try {
      if (propInfo.paths.length === 1) {
        return Reflect.set(target, propInfo.name, value, receiver);
      }
      withIndexes(
        propInfo, loopIndexes, () => {
          if (propInfo.pattern in target) {
            Reflect.set(target, propInfo.pattern, value, receiver)
          } else {
            const lastPatternElement = propInfo.patternElements[propInfo.patternElements.length - 1];
            const lastElement = propInfo.elements[propInfo.elements.length - 1];
            const isWildcard = lastPatternElement === "*";
            const parentValue = getValue(
              target, 
              propInfo.patternPaths, 
              propInfo.patternElements,
              loopIndexes, 
              propInfo.paths.length - 2, 
              propInfo.wildcardCount - (isWildcard ? 1 : 0) - 1, 
              receiver);
            Reflect.set(parentValue, isWildcard ? loopIndexes?.index ?? utils.raise("wildcard is undefined") : lastElement, value);
          }
        }
      );
      return true;
    } finally {
      if (callable) {
        notifyCallback(propInfo.pattern, loopIndexes);
      }
    }
  }
}
