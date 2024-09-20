import { IUpdator } from "../updator/types";
import { IBinding, INodeProperty } from "./types";

export function setValueToChildNodes(
  binding: IBinding,
  updator: IUpdator | undefined,
  nodeProperty: INodeProperty,
  setOfIndex:Set<number>
): void {
  updator?.applyNodeUpdatesByBinding(binding, () => {
    nodeProperty.applyToChildNodes(setOfIndex);
  });
}
