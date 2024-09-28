import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { GetValueDirectFn } from "./types";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { getValueWithoutIndexesFn, IHandlerPartialForGetValueWithoutIndexes } from "./getValueWithoutIndexesFn";

type IHandlerPartial = Pick<Handler, "get">

export type IHandlerPartialForGetValueDirect = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForGetValue & IHandlerPartialForGetValueWithoutIndexes;

export const getValueDirectFn = (handler: IHandlerPartialForGetValueDirect): GetValueDirectFn => {
  const withIndexes = withIndexesFn(handler);
  const getValue = getValueFn(handler);
  const getValueWithoutIndexes = getValueWithoutIndexesFn(handler);
  return function (
    target: object, 
    prop: string, 
    indexes: number[], 
    receiver: object
  ) {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const isIndex = prop[0] === "$";
    const isExpand = prop[0] === "@";
    const propName = isExpand ? prop.slice(1) : prop;
    // パターンではないものも来る可能性がある
    const propInfo = getPropInfo(propName);
    return withIndexes(
      propInfo, indexes, () => {
      if (isIndex || isExpand) {
        return handler.get(target, prop, receiver);
      } else {
        if (propInfo.allIncomplete) {
          return getValue(
            target, 
            propInfo.patternPaths,
            propInfo.patternElements, 
            indexes, 
            propInfo.paths.length - 1, 
            propInfo.wildcardCount - 1, 
            receiver);
        } else {
          return getValueWithoutIndexes(target, prop, receiver);
        }
      }
    });
  
  }
}
