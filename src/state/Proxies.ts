import { getAccessorProperties } from "./AccessorProperties"
import { DEPENDENCIES } from "./Const";
import { DependentProps } from "./DependentProps";
import { StateBaseHandler } from "./StateBaseHandler"
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";

type Proxies = {
  base:State, write:State, readonly:State
}

// todo: HTMLElementをComponentに変更
export function getProxies(component:HTMLElement, state:State):Proxies {
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(state[DEPENDENCIES] ?? {});
  return {
    base: new Proxy<State>(state, new StateBaseHandler(component, accessorProperties, dependencies)),
    write: new Proxy<State>(state, new StateWriteHandler(component, accessorProperties, dependencies)),
    readonly: new Proxy<State>(state, new StateReadOnlyHandler(component, accessorProperties, dependencies))
  }
}