import { getAccessorProperties } from "./AccessorProperties";
import { DependentProps } from "./DependentProps";
import { IBaseState, StateInfo } from "./types";

const DEPENDENT_PROPS = "$dependentProps";

export function getStateInfo(state:IBaseState):StateInfo {
  return {
    accessorProperties: new Set(getAccessorProperties(state)),
    dependentProps: new DependentProps(state[DEPENDENT_PROPS] ?? {})
  };
}