import { createNamedWildcardIndexes } from "./createNamedWildcardIndexes";
import { IDotNotationHandler, Indexes, IPatternInfo, WithIndexesFn } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes">;

export type IHandlerPartialForWithIndexes = IHandlerPartial;

/**
 * インデックス配列を指定して処理を行う関数を取得する
 * インデックス配列は、スタックに積まれる
 * @param handler Proxyハンドラ
 * @returns {WithIndexesFn} インデックスを指定して処理を行う関数
 */
export const withIndexesFn = (handler: IHandlerPartialForWithIndexes): WithIndexesFn => {
  return function (
    patternInfo: IPatternInfo, 
    indexes: Indexes, 
    callback: () => any
  ): any {
    const { stackNamedWildcardIndexes, stackIndexes } = handler;
    stackNamedWildcardIndexes.push(createNamedWildcardIndexes(patternInfo, indexes));
    stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      stackNamedWildcardIndexes.pop();
      stackIndexes.pop();
    }
  }
}

