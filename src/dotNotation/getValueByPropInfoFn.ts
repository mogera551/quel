import { INamedLoopIndexes } from "../loopContext/types";
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
    const namedLoopIndexes: INamedLoopIndexes = handler.getNamedLoopIndexesStack?.().lastNamedLoopIndexes ?? utils.raise("setValueFromPropInfoFn: namedLoopIndexes is undefined");
    return getValue(
      target, 
      propInfo.patternPaths,
      propInfo.patternElements,
      propInfo.wildcardPaths,
      namedLoopIndexes,
      propInfo.paths.length - 1, 
      propInfo.wildcardCount - 1, 
      receiver 
    );
  }
}