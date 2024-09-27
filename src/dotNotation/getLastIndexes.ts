import { IDotNotationHandler, Indexes, NamedWildcardIndexes } from "./types";

export const getLastIndexes = (handler: Pick<IDotNotationHandler, "stackNamedWildcardIndexes">) =>
function(
  pattern:string
): Indexes | undefined {
  const stackNamedWildcardIndexes = handler.stackNamedWildcardIndexes;
  return stackNamedWildcardIndexes[stackNamedWildcardIndexes.length - 1]?.[pattern]?.indexes;
};
