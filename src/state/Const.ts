
export const DEPENDENCIES = "$dependentProps";

const name = "state";

export const AccessorPropertiesSymbol:symbol = Symbol.for(`${name}.accessorProperties`);
export const DependenciesSymbol:symbol = Symbol.for(`${name}.dependencies`);

export const ConnectedEventSymbol:symbol = Symbol.for(`${name}.connectedEvent`);
export const DisconnectedEventSymbol:symbol = Symbol.for(`${name}.disconnectedEvent`);
export const UpdatedEventSymbol:symbol = Symbol.for(`${name}.updatedEvent`);

export const ConnectedCallbackSymbol:unique symbol = Symbol.for(`${name}.connectedCallback`);
export const DisconnectedCallbackSymbol:unique symbol = Symbol.for(`${name}.disconnectedCallback`);
export const UpdatedCallbackSymbol:unique symbol = Symbol.for(`${name}.updatedCallback`);

export const DirectryCallApiSymbol:unique symbol = Symbol.for(`${name}.directlyCallApi`);
export const NotifyForDependentPropsApiSymbol:unique symbol = Symbol.for(`${name}.notifyForDependentPropsApi`);
export const GetDependentPropsApiSymbol:unique symbol = Symbol.for(`${name}.getDependentPropsApi`);
export const ClearCacheApiSymbol:unique symbol = Symbol.for(`${name}.clearCacheApi`);
export const CreateBufferApiSymbol:unique symbol = Symbol.for(`${name}.createBufferApi`);
export const FlushBufferApiSymbol:unique symbol = Symbol.for(`${name}.flushBufferApi`);

