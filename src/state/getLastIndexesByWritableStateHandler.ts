import { GetLastIndexesFn, Indexes } from "../dotNotation/types";
import { Handler } from "./Handler";
import { IStateHandler, IWritableStateHandler } from "./types";

type IHandlerPartial = Pick<IWritableStateHandler & Handler, "stackNamedWildcardIndexes"|"loopContext">;

export const getLastIndexesByWritableStateHandler = (handler: IHandlerPartial): GetLastIndexesFn => {
  return function (pattern: string): Indexes | undefined {
    const { stackNamedWildcardIndexes, loopContext } = handler;
    return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.[pattern]?.indexes ?? loopContext?.find(pattern)?.indexes;
  }
}
