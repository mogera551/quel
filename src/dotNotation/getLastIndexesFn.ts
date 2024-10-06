import { GetLastIndexesFn, IDotNotationHandler, Indexes } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes">;

type IHandlerPartialForGetLastIndexes = IHandlerPartial;

/**
 * 名前付きワイルドカードインデックスの最後のインデックスを取得する関数を生成します
 * @param handler Proxyハンドラ
 * @returns {GetLastIndexesFn} 名前付きワイルドカードインデックスの最後のインデックスを取得する関数
 */
export const getLastIndexesFn = (handler: IHandlerPartialForGetLastIndexes): GetLastIndexesFn =>
function(
  pattern:string
): Indexes | undefined {
  const stackNamedWildcardIndexes = handler.stackNamedWildcardIndexes;
  return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.get(pattern)?.indexes;
};
