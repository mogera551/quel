import { getAccessorProperties } from "./AccessorProperties";
import { DependentProps } from "./DependentProps";
import { IBaseState, StateInfo } from "./types";

const DEPENDENT_PROPS = "$dependentProps";

const _cache: Map<IBaseState,StateInfo> = new Map;

export function getStateInfo(state: IBaseState): StateInfo {
  // readonlyとwritableで同じものを使う
  if (_cache.has(state)) {
    return _cache.get(state) as StateInfo;
  } else {
    const stateInfo = {
      accessorProperties: new Set(getAccessorProperties(state)),
      dependentProps: new DependentProps(state[DEPENDENT_PROPS] ?? {})
    };
    _cache.set(state, stateInfo);
    return stateInfo;
  }
}