import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createOverrideLoopIndexes } from "../loopContext/createOverrideLoopIndexes";
import { INamedLoopIndexes } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { getPropInfo } from "../propertyInfo/getPropInfo";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { IPropInfo } from "../propertyInfo/types";
import { IStateHandler } from "./types";

type IHandlerPartial = Pick<IStateHandler, "getNamedLoopIndexesStack"|"notifyCallback">;

export type IHandlerPartialForSetValueByPropInfo = IHandlerPartial & IHandlerPartialForGetValue;

export function setValueByPropInfoFn(handler: IHandlerPartialForSetValueByPropInfo) {
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    propInfo: IPropInfo,
    value: any,
    receiver: object
  ): boolean {
    const notifyCallback = handler.notifyCallback;
    let namedLoopIndexes: INamedLoopIndexes;
    const _setValue = () => {
      try {
        if (propInfo.elements.length === 1) {
          return Reflect.set(target, propInfo.name, value, receiver);
        }
        if (propInfo.pattern in target) {
          return Reflect.set(target, propInfo.pattern, value, receiver);
        }
        const parentPath = propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined");
        const parentPropInfo = getPropInfo(parentPath);
        const parentValue = getValue(
          target, 
          parentPropInfo.patternPaths,
          parentPropInfo.patternElements,
          parentPropInfo.wildcardPaths,
          namedLoopIndexes,
          parentPropInfo.paths.length - 1, 
          parentPropInfo.wildcardCount - 1, 
          receiver 
        );
        const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
        const isWildcard = lastElement === "*";
    
        return Reflect.set(
          parentValue, 
          isWildcard ? (
            namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")
          ) : lastElement  , value);
      } finally {
        if (notifyCallback) {
          notifyCallback(
            propInfo.pattern, 
            namedLoopIndexes.get(propInfo.wildcardPaths.at(-1) ?? ""));
        }
      }
    };
    const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "none") {
      namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      return _setValue();
    } else if (propInfo.wildcardType === "all") {
      namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
    } else {
      const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
      namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
    }

 }
}