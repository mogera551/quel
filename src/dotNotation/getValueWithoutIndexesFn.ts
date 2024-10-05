import { getPropInfo } from "./getPropInfo";
import { GetValueWithoutIndexesFn, IDotNotationHandler } from "./types";
import { getValueWithIndexesFn, IHandlerPartialForGetValueWithIndexes } from "./getValueWithIndexesFn";

type IHandlerPartial = Pick<IDotNotationHandler, "getLastIndexes">;

export type IHandlerPartialForGetValueWithoutIndexes = IHandlerPartial & IHandlerPartialForGetValueWithIndexes;

/**
 * ドット記法のプロパティからインデックスを指定せずに値を取得する関数を取得する
 * ex) "aaa.1.bbb.2.ccc"のようなワイルドカードを含まないプロパティを想定
 * @param handler Proxyハンドラ
 * @returns {GetValueWithoutIndexesFn} ドット記法のプロパティからインデックスを指定せずに値を取得する関数
 */
export const getValueWithoutIndexesFn = (handler: IHandlerPartialForGetValueWithoutIndexes): GetValueWithoutIndexesFn => {
  const getValueWithIndexes = getValueWithIndexesFn(handler);
  return function (target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = handler.getLastIndexes(propInfo.wildcardPaths[propInfo.wildcardPaths.length - 1] ?? "") ?? [];
    const wildcardIndexes = 
      propInfo.allComplete ? propInfo.wildcardIndexes :
      propInfo.allIncomplete ? lastStackIndexes :
      propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return getValueWithIndexes(target, propInfo, wildcardIndexes, receiver);
  };

}
