import { IUpdater } from "../updater/types";
import { IBinding, INodeProperty } from "./types";

export function setValueToChildNodes(
  binding: IBinding,
  updater: IUpdater | undefined,
  nodeProperty: INodeProperty,
  setOfIndex:Set<number>
): void {
  updater?.applyNodeUpdatesByBinding(binding, () => {
    nodeProperty.applyToChildNodes(setOfIndex);
  });
}
