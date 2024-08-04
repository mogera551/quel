
export const DEPENDENCIES = "$dependentProps";

const name = "state";

export const AccessorPropertiesSymbol:symbol = Symbol.for(`${name}.accessorProperties`);
export const DependenciesSymbol:symbol = Symbol.for(`${name}.dependencies`);

export const ConnectedEventSymbol:symbol = Symbol.for(`${name}.connectedEvent`);
export const DisconnectedEventSymbol:symbol = Symbol.for(`${name}.disconnectedEvent`);
export const UpdatedEventSymbol:symbol = Symbol.for(`${name}.updatedEvent`);

export const ConnectedCallbackSymbol:symbol = Symbol.for(`${name}.connectedCallback`);
export const DisconnectedCallbackSymbol:symbol = Symbol.for(`${name}.disconnectedCallback`);
export const UpdatedCallbackSymbol:symbol = Symbol.for(`${name}.updatedCallback`);

export const DirectryCallApiSymbol:symbol = Symbol.for(`${name}.directlyCallApi`);
export const NotifyForDependentPropsApiSymbol:symbol = Symbol.for(`${name}.notifyForDependentPropsApi`);
export const GetDependentPropsApiSymbol:symbol = Symbol.for(`${name}.getDependentPropsApi`);
export const ClearCacheApiSymbol:symbol = Symbol.for(`${name}.clearCacheApi`);
export const CreateBufferApiSymbol:symbol = Symbol.for(`${name}.createBufferApi`);
export const FlushBufferApiSymbol:symbol = Symbol.for(`${name}.flushBufferApi`);

