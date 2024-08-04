
export const DEPENDENCIES = "$dependentProps";

const name = "state";

export const AccessorPropertiesSymbol:unique symbol = Symbol.for(`${name}.accessorProperties`);
export const DependenciesSymbol:unique symbol = Symbol.for(`${name}.dependencies`);

