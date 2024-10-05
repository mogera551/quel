import { getPropInfo } from "./getPropInfo";
import { IDotNotationHandler, SetValueWithoutIndexesFn } from "./types";
import { setValueWithIndexesFn, IHandlerPartialForSetValueWithIndexes } from "./setValueWithIndexesFn";

type IHandlerPartial = Pick<IDotNotationHandler, "getLastIndexes">;

export type IHandlerPartialForSetValueWithoutIndexes = IHandlerPartial & IHandlerPartialForSetValueWithIndexes;

/**
 * ドット記法のプロパティからインデックスを指定せずに値をセットする関数を取得する
 * ex) "aaa.1.bbb.2.ccc"のようなワイルドカードを含まないプロパティを想定
 * @param handler Proxyハンドラ
 * @returns {SetValueWithoutIndexesFn} ドット記法のプロパティからインデックスを指定せずに値をセットする関数
 */
export const setValueWithoutIndexesFn = (handler: IHandlerPartialForSetValueWithoutIndexes): SetValueWithoutIndexesFn => {
  const setValueWithIndexes = setValueWithIndexesFn(handler);
  return function (
    target: object, 
    prop: string, 
    value: any, 
    receiver: object
  ): boolean {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = handler.getLastIndexes(propInfo.wildcardPaths[propInfo.wildcardPaths.length - 1] ?? "") ?? [];
    const wildcardIndexes = 
      propInfo.allComplete ? propInfo.wildcardIndexes :
      propInfo.allIncomplete ? lastStackIndexes :
      propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return setValueWithIndexes(target, propInfo, wildcardIndexes, value, receiver);
  }
}
