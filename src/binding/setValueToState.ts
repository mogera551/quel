import { INodeProperty, IStateProperty } from "./types";

export function setValueToState(
  nodeProperty: INodeProperty,
  stateProperty: IStateProperty
) {
  if (!stateProperty.applicable) return;
  stateProperty.value = nodeProperty.filteredValue;
}
