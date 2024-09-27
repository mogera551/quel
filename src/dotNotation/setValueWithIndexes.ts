import { IDotNotationHandler, IPropInfo } from "./types";
import { utils } from "../utils";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes"|"getValue"|"withIndexes">;

export const setValueWithIndexes = (handler: IHandlerPartial) => {
  return function (
    target: object, 
    propInfo: IPropInfo, 
    indexes: (number|undefined)[], 
    value: any, 
    receiver: object
  ): boolean {
    if (propInfo.paths.length === 1) {
      return Reflect.set(target, propInfo.name, value, receiver);
    }
    handler.withIndexes(
      propInfo, indexes, () => {
      if (propInfo.name in target) {
        Reflect.set(target, propInfo.name, value, receiver)
      } else {
        const lastPatternElement = propInfo.patternElements[propInfo.patternElements.length - 1];
        const lastElement = propInfo.elements[propInfo.elements.length - 1];
        const parentValue = handler.getValue(
          target, 
          propInfo.patternPaths, 
          propInfo.patternElements,
          indexes, 
          propInfo.paths.length - 2, 
          propInfo.wildcardCount - (lastPatternElement === "*" ? 1 : 0) - 1, 
          receiver);
        if (lastPatternElement === "*") {
          parentValue[indexes[indexes.length - 1] ?? utils.raise("wildcard is undefined")] = value;
        } else {
          parentValue[lastElement] = value;
        }
      }
    });
    return true;
  }
}
