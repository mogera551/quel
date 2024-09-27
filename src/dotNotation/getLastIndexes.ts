import { GetLastIndexesFn, IDotNotationHandler, Indexes } from "./types";

export const getLastIndexes = (handler: Pick<IDotNotationHandler, "stackNamedWildcardIndexes">): GetLastIndexesFn =>
function(
  pattern:string
): Indexes | undefined {
  const stackNamedWildcardIndexes = handler.stackNamedWildcardIndexes;
  return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.[pattern]?.indexes;
};
