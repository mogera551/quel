import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { setValueDirectFn } from "./types";
import { withIndexes as _withIndexes } from "./withIndexes";

type IHandlerPartial = Pick<Handler, "stackIndexes"|"stackNamedWildcardIndexes"|"getValue"|"set"| "setValueWithIndexes" | "setValueWithoutIndexes" | "getLastIndexes">;

export const setValueDirect = (handler: IHandlerPartial): setValueDirectFn => {
  return function (
    target: object, 
    prop: string, 
    indexes: number[], 
    value: any, 
    receiver: object
  ): boolean {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
    const withIndexes = _withIndexes(handler);
    const isIndex = prop[0] === "$";
    const isExpand = prop[0] === "@";
    const propName = isExpand ? prop.slice(1) : prop;
    // パターンではないものも来る可能性がある
    const propInfo = getPropInfo(propName);
    if (isIndex || isExpand) {
      return withIndexes(
        propInfo, indexes, () => {
        return handler.set(target, prop, value, receiver);
      });
    } else {
      return handler.setValueWithIndexes(target, propInfo, indexes, value, receiver);
    }
  }
}
