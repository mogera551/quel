
const name = "component";
export const IsComponentSymbol:unique symbol = Symbol.for(`${name}.isComponent`);
export const ModuleSymbol:unique symbol = Symbol.for(`${name}.module`);
export const CustomElementInfoSymbol:unique symbol = Symbol.for(`${name}.customElementInfo`);
export const SetCustomElementInfoSymbol:unique symbol = Symbol.for(`${name}.setCustomElementInfo`);
export const FilterManagersSymbol:unique symbol = Symbol.for(`${name}.filterManagers`);
export const SetFilterManagersSymbol:unique symbol = Symbol.for(`${name}.setFilterManagers`);

const props = "props";
export const BindPropertySymbol:unique symbol = Symbol.for(`${props}.bindProperty`);
export const SetBufferSymbol:unique symbol = Symbol.for(`${props}.setBuffer`);
export const GetBufferSymbol:unique symbol = Symbol.for(`${props}.getBuffer`);
export const ClearBufferSymbol:unique symbol = Symbol.for(`${props}.clearBuffer`);
export const CreateBufferSymbol:unique symbol = Symbol.for(`${props}.createBuffer`);
export const FlushBufferSymbol:unique symbol = Symbol.for(`${props}.flushBuffer`);
export const ClearSymbol:unique symbol = Symbol.for(`${props}.clear`);
export const ToObjectSymbol:unique symbol = Symbol.for(`${props}.toObject`);
export const PropInitializeSymbol:unique symbol = Symbol.for(`${props}.initialize`);
