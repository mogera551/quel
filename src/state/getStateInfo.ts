import { getAccessorProperties } from "./getAccessorProperties";
import { DependentProps } from "./DependentProps";
import { IBaseState, StatePropertyInfo } from "./types";

const DEPENDENT_PROPS = "$dependentProps";

const _cache: Map<IBaseState,StatePropertyInfo> = new Map;

export function getStateInfo(state: IBaseState): StatePropertyInfo {
  // readonlyとwritableで同じものを使う
  let stateProeprtyInfo = _cache.get(state);
  if (typeof stateProeprtyInfo === "undefined") {
    stateProeprtyInfo = {
      accessorProperties: new Set(getAccessorProperties(state)),
      dependentProps: new DependentProps(state[DEPENDENT_PROPS] ?? {})
    };
    _cache.set(state, stateProeprtyInfo);
  }
  return stateProeprtyInfo;
}