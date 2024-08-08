
export const WILDCARD = "*";
export const DELIMITER = ".";
export const RE_CONTEXT_INDEX = new RegExp(/^\$([0-9]+)$/);

const name = "do-notation";
export const GetDirectSymbol:unique symbol = Symbol.for(`${name}.getDirect`);
export const SetDirectSymbol:unique symbol = Symbol.for(`${name}.setDirect`);

