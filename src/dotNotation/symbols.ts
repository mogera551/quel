const name = "do-notation";
export const GetDirectSymbol:unique symbol = Symbol.for(`${name}.getDirect`);
export const SetDirectSymbol:unique symbol = Symbol.for(`${name}.setDirect`);

export const GetAccessorSymbol:unique symbol = Symbol.for(`${name}.getAccessor`);
export const SetAccessorSymbol:unique symbol = Symbol.for(`${name}.setAccessor`);

export const GetByPropInfoSymbol:unique symbol = Symbol.for(`${name}.getAccessor`);
export const SetByPropInfoSymbol:unique symbol = Symbol.for(`${name}.setAccessor`);


const wildcardIndexes = "wildcardIndexes";
export const NamedWildcardIndexesDisposeSymbol:unique symbol = Symbol.for(`${wildcardIndexes}.dispose`);
