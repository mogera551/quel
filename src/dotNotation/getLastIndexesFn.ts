import { GetLastIndexesFn, IDotNotationHandler, Indexes } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes">;

export type IHandlerPartialForGetLastIndexes = IHandlerPartial;

export const getLastIndexesFn = (handler: IHandlerPartialForGetLastIndexes): GetLastIndexesFn =>
function(
  pattern:string
): Indexes | undefined {
  const stackNamedWildcardIndexes = handler.stackNamedWildcardIndexes;
  return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.[pattern]?.indexes;
};
