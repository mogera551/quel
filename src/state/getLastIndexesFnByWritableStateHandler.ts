import { GetLastIndexesFn, Indexes } from "../dotNotation/types";
import { Handler } from "./Handler";
import { IWritableStateHandler } from "./types";

type IHandlerPartial = Pick<IWritableStateHandler & Handler, "stackNamedWildcardIndexes"|"updator">;

export const getLastIndexesFnByWritableStateHandler = (handler: IHandlerPartial): GetLastIndexesFn => {
  return function (pattern: string): Indexes | undefined {
    const { updator, stackNamedWildcardIndexes } = handler;
    return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.get(pattern)?.indexes ?? 
      updator.namedLoopIndexesStack?.getLoopIndexes(pattern)?.values;
  }
}
