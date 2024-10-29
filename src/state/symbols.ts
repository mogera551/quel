const name = "state";

export const AccessorPropertiesSymbol:unique symbol = Symbol.for(`${name}.accessorProperties`);
export const DependenciesSymbol:unique symbol = Symbol.for(`${name}.dependencies`);

export const ConnectedEventSymbol:unique symbol = Symbol.for(`${name}.connectedEvent`);
export const DisconnectedEventSymbol:unique symbol = Symbol.for(`${name}.disconnectedEvent`);
export const UpdatedEventSymbol:unique symbol = Symbol.for(`${name}.updatedEvent`);

export const ConnectedCallbackSymbol:unique symbol = Symbol.for(`${name}.connectedCallback`);
export const DisconnectedCallbackSymbol:unique symbol = Symbol.for(`${name}.disconnectedCallback`);
export const UpdatedCallbackSymbol:unique symbol = Symbol.for(`${name}.updatedCallback`);

export const DirectryCallApiSymbol:unique symbol = Symbol.for(`${name}.directlyCallApi`);
export const NotifyForDependentPropsApiSymbol:unique symbol = Symbol.for(`${name}.notifyForDependentPropsApi`);
export const GetDependentPropsApiSymbol:unique symbol = Symbol.for(`${name}.getDependentPropsApi`);
export const ClearCacheApiSymbol:unique symbol = Symbol.for(`${name}.clearCacheApi`);

export const GetDirectSymbol:unique symbol = Symbol.for(`${name}.getDirect`);
export const SetDirectSymbol:unique symbol = Symbol.for(`${name}.setDirect`);

export const GetAccessorSymbol:unique symbol = Symbol.for(`${name}.getAccessor`);
export const SetAccessorSymbol:unique symbol = Symbol.for(`${name}.setAccessor`);

export const GetByPropInfoSymbol:unique symbol = Symbol.for(`${name}.getAccessor`);
export const SetByPropInfoSymbol:unique symbol = Symbol.for(`${name}.setAccessor`);
