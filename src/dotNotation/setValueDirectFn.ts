import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { SetValueDirectFn } from "./types";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { setValueWithIndexesFn, IHandlerPartialForSetValueWithIndexes } from "./setValueWithIndexesFn";

type IHandlerPartial = Pick<Handler, "set">;

export type IHandlerPartialForSetValueDirect = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForSetValueWithIndexes;

/**
 * ドット記法のプロパティと配列を指定して直接setValueから値をセットする関数を生成します
 * 高速化のために使用します
 * @param handler Proxyハンドラ
 * @returns {SetValueDirectFn} ドット記法のプロパティと配列を指定して直接setValueから値をセットする関数
 */
export const setValueDirectFn = (handler: IHandlerPartialForSetValueDirect): SetValueDirectFn => {
  const withIndexes = withIndexesFn(handler);
  const setValueWithIndexes = setValueWithIndexesFn(handler);
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
