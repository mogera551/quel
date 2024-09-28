import { IDotNotationHandler, IPropInfo, SetValueWithIndexesFn } from "./types";
import { utils } from "../utils";
import { withIndexes as _withIndexes } from "./withIndexes";
import { getValue as _getValue } from "./getValue";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes"|"cache"|"findPropertyCallback"|"notifyCallback">;

export const setValueWithIndexes = (handler: IHandlerPartial): SetValueWithIndexesFn => {
  const withIndexes = _withIndexes(handler);
  const getValue = _getValue(handler);
  return function (
    target: object, 
    propInfo: IPropInfo, 
    indexes: (number|undefined)[], 
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
        propInfo, indexes, () => {
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
              indexes, 
              propInfo.paths.length - 2, 
              propInfo.wildcardCount - (isWildcard ? 1 : 0) - 1, 
              receiver);
            Reflect.set(parentValue, isWildcard ? indexes[indexes.length - 1] ?? utils.raise("wildcard is undefined") : lastElement, value);
/*
            if (isWildcard) {
              parentValue[indexes[indexes.length - 1] ?? utils.raise("wildcard is undefined")] = value;
            } else {
              parentValue[lastElement] = value;
            }
*/
          }
        }
      );
      return true;
    } finally {
      if (callable) {
        notifyCallback(propInfo.pattern, indexes as number[]);
      }
    }
  }
}
