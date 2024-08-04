import { getAccessorProperties } from "./AccessorProperties"
import { DEPENDENCIES } from "./Const";
import { DependentProps } from "./DependentProps";
import { StateBaseHandler } from "./StateBaseHandler"
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";

type Proxies = {
  base:State, write:State, readonly:State
}

export function getProxies(state:State):Proxies {
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(state[DEPENDENCIES] ?? {});
  return {
    base: new Proxy<State>(state, new StateBaseHandler(accessorProperties, dependencies)),
    write: new Proxy<State>(state, new StateWriteHandler(accessorProperties, dependencies)),
    readonly: new Proxy<State>(state, new StateReadOnlyHandler(accessorProperties, dependencies))
  }
}