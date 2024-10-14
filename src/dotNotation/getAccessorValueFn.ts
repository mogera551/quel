import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { GetValueAccessorFn } from "./types";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";
import { IHandlerPartialForGetValueWithoutIndexes } from "./getValueWithoutIndexesFn";
import { IStatePropertyAccessor } from "../state/types";

type IHandlerPartial = Pick<Handler, "get">

export type IHandlerPartialForGetValueAccessor = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForGetValue & IHandlerPartialForGetValueWithoutIndexes;

/**
 * ドット記法のプロパティと配列を指定して直接getValueから値を取得する関数を生成します
 * 高速化のために使用します
 * @param handler Proxyハンドラ
 * @returns {GetValueDirectFn} ドット記法のプロパティと配列を指定して直接getValueから値を取得する関数
 */
export const getValueAccessorFn = (handler: IHandlerPartialForGetValueAccessor): GetValueAccessorFn => {
  const withIndexes = withIndexesFn(handler);
  const getValue = getValueFn(handler);
  return function (
    target: object, 
    accessor: IStatePropertyAccessor,
    receiver: object
  ) {
    // パターンではないものはこない
    const propInfo = getPropInfo(accessor.pattern);
    return withIndexes(
      propInfo, accessor.loopIndexes, () => {
        return getValue(
          target, 
          propInfo.patternPaths,
          propInfo.patternElements, 
          accessor.loopIndexes, 
          propInfo.paths.length - 1, 
          propInfo.wildcardCount - 1, 
          receiver);
      }
    );
  
  }
}
