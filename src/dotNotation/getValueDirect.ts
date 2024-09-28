import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { getValueDirectFn } from "./types";
import { withIndexes as _withIndexes } from "./withIndexes";
import { getValue as _getValue } from "./getValue";
import { getValueWithoutIndexes as _getValueWithoutIndexes } from "./getValueWithoutIndexes";

type IHandlerPartial = Pick<Handler, "get"|"stackIndexes"|"stackNamedWildcardIndexes"|"cache"|"findPropertyCallback" | "getLastIndexes">;

export const getValueDirect = (handler: IHandlerPartial): getValueDirectFn => {
  const withIndexes = _withIndexes(handler);
  const getValue = _getValue(handler);
  const getValueWithoutIndexes = _getValueWithoutIndexes(handler);
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
