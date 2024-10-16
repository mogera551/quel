import { createLoopIndexes } from "../loopContext/createLoopIndexes";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createOverrideLoopIndexes } from "../loopContext/createOverrideLoopIndexes";
import { INamedLoopIndexes } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { IDotNotationHandler, IPropInfo } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "getNamedLoopIndexesStack">;

export type IHandlerPartialForGetValueByPropInfo = IHandlerPartial & IHandlerPartialForGetValue;

export function getValueByPropInfoFn(handler: IHandlerPartialForGetValueByPropInfo) {
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    propInfo: IPropInfo,
    receiver: object
  ) {
    let namedLoopIndexes: INamedLoopIndexes;
    const _getValue = () => getValue(
      target, 
      propInfo.patternPaths,
      propInfo.patternElements,
      propInfo.wildcardPaths,
      namedLoopIndexes,
      propInfo.paths.length - 1, 
      propInfo.wildcardCount - 1, 
      receiver 
    );

    const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
    if (propInfo.allIncomplete) {
      namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      return _getValue();
    } else if (propInfo.allComplete) {
      namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
    } else {
      const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
      const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
      const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
      namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
    }
  }
}