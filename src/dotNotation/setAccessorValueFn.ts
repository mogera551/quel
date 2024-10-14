import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { SetValueAccessorFn } from "./types";
import { IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { setValueWithIndexesFn, IHandlerPartialForSetValueWithIndexes } from "./setValueWithIndexesFn";
import { IStatePropertyAccessor } from "../state/types";

type IHandlerPartial = Pick<Handler, "set">;

export type IHandlerPartialForSetValueAccessor = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForSetValueWithIndexes;

/**
 * ドット記法のプロパティと配列を指定して直接setValueから値をセットする関数を生成します
 * 高速化のために使用します
 * @param handler Proxyハンドラ
 * @returns {SetValueDirectFn} ドット記法のプロパティと配列を指定して直接setValueから値をセットする関数
 */
export const setValueAccessorFn = (handler: IHandlerPartialForSetValueAccessor): SetValueAccessorFn => {
  const setValueWithIndexes = setValueWithIndexesFn(handler);
  return function (
    target: object, 
    accessor: IStatePropertyAccessor,
    value: any, 
    receiver: object
  ): boolean {
    // パターンではないものはこない
    const propInfo = getPropInfo(accessor.pattern);
    return setValueWithIndexes(target, propInfo, accessor.loopIndexes, value, receiver);
  }
}
