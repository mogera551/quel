import { IUpdater } from "../updater/types";
import { IBinding, INodeProperty, IStateProperty } from "./types";

export function setValueToNode(
  binding: IBinding,
  updater: IUpdater | undefined,
  nodeProperty: INodeProperty,
  stateProperty: IStateProperty
): void {
  if (!nodeProperty.applicable) return;
  updater?.applyNodeUpdatesByBinding(binding, () => {
    // 値が同じかどうかの判定をするよりも、常に値をセットするようにしたほうが速い
    nodeProperty.setValue(stateProperty.getFilteredValue() ?? "");
  });
}
