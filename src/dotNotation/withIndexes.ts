import { createNamedWildcardIndexes } from "./createNamedWildcardIndexes";
import { IDotNotationHandler, Indexes, IPatternInfo } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes">;

export const withIndexes = (handler: IHandlerPartial) => {
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

