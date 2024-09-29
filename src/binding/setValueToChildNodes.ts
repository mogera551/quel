import { CleanIndexes } from "../dotNotation/types";
import { IUpdator } from "../updator/types";
import { IBinding, INodeProperty } from "./types";

export function setValueToChildNodes(
  binding: IBinding,
  updator: IUpdator | undefined,
  nodeProperty: INodeProperty,
  setOfIndex:Set<number>,
  indexes?: CleanIndexes
): void {
  updator?.applyNodeUpdatesByBinding(binding, () => {
    nodeProperty.applyToChildNodes(setOfIndex, indexes);
  });
}
