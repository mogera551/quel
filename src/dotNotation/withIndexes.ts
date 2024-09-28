import { createNamedWildcardIndexes } from "./createNamedWildcardIndexes";
import { IDotNotationHandler, Indexes, IPatternInfo, WithIndexesFn } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes">;

export type IHandlerPartialForWithIndexes = IHandlerPartial;

export const withIndexes = (handler: IHandlerPartialForWithIndexes): WithIndexesFn => {
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

