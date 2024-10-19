const name = "bindingProps";

export const BindPropertySymbol:unique symbol = Symbol.for(`${name}.bindPropertySymbol`);
export const GetBufferSymbol:unique symbol = Symbol.for(`${name}.getBufferSymbol`);
export const SetBufferSymbol:unique symbol = Symbol.for(`${name}.setBufferSymbol`);
export const CreateBufferSymbol:unique symbol = Symbol.for(`${name}.createBufferSymbol`);
export const FlushBufferSymbol:unique symbol = Symbol.for(`${name}.flushBufferSymbol`);
export const ClearBufferSymbol:unique symbol = Symbol.for(`${name}.clearBufferSymbol`);
