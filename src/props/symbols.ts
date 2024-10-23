const name = "bindingProps";

export const BindPropertySymbol:unique symbol = Symbol.for(`${name}.bindPropertySymbol`);
export const CheckDuplicateSymbol:unique symbol = Symbol.for(`${name}.checkDuplicateSymbol`);
export const HasBufferSymbol:unique symbol = Symbol.for(`${name}.hasBufferSymbol`);
export const CreateBufferSymbol:unique symbol = Symbol.for(`${name}.createBufferSymbol`);
export const GetBufferSymbol:unique symbol = Symbol.for(`${name}.getBufferSymbol`);
export const FlushBufferSymbol:unique symbol = Symbol.for(`${name}.flushBufferSymbol`);
export const SetBufferSymbol:unique symbol = Symbol.for(`${name}.setBufferSymbol`);
export const ClearBufferSymbol:unique symbol = Symbol.for(`${name}.clearBufferSymbol`);
