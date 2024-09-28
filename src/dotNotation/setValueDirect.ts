import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { setValueDirectFn } from "./types";
import { withIndexes as _withIndexes, IHandlerPartialForWithIndexes } from "./withIndexes";
import { setValueWithIndexes as _setValueWithIndexes, IHandlerPartialForSetValueWithIndexes } from "./setValueWithIndexes";

type IHandlerPartial = Pick<Handler, "set">;

export type IHandlerPartialForSetValueDirect = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForSetValueWithIndexes;

export const setValueDirect = (handler: IHandlerPartialForSetValueDirect): setValueDirectFn => {
  const withIndexes = _withIndexes(handler);
  const setValueWithIndexes = _setValueWithIndexes(handler);
  return function (
    target: object, 
    prop: string, 
    indexes: number[], 
    value: any, 
    receiver: object
  ): boolean {
    if (typeof prop !== "string") utils.raise(`prop is not string`);
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
      return setValueWithIndexes(target, propInfo, indexes, value, receiver);
    }
  }
}
