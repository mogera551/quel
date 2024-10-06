const name = "do-notation";
export const GetDirectSymbol:unique symbol = Symbol.for(`${name}.getDirect`);
export const SetDirectSymbol:unique symbol = Symbol.for(`${name}.setDirect`);

const wildcardIndexes = "wildcardIndexes";
export const NamedWildcardIndexesDisposeSymbol:unique symbol = Symbol.for(`${wildcardIndexes}.dispose`);
