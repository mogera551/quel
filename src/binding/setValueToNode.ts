import { IUpdator } from "../updator/types";
import { IBinding, INodeProperty, IStateProperty } from "./types";

export function setValueToNode(
  binding: IBinding,
  updator: IUpdator | undefined,
  nodeProperty: INodeProperty,
  stateProperty: IStateProperty
): void {
  if (!nodeProperty.applicable) return;
  updator?.applyNodeUpdatesByBinding(binding, () => {
    // 値が同じかどうかの判定をするよりも、常に値をセットするようにしたほうが速い
    nodeProperty.setValue(stateProperty.getFilteredValue() ?? "");
  });
}
