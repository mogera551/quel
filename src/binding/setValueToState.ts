import { CleanIndexes } from "../dotNotation/types";
import { INodeProperty, IStateProperty } from "./types";

export function setValueToState(
  nodeProperty: INodeProperty,
  stateProperty: IStateProperty
) {
  if (!stateProperty.applicable) return;
  stateProperty.setValue(nodeProperty.getFilteredValue());
}
