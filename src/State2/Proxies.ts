import { getAccessorProperties } from "./AccessorProperties"
import { DEPENDENCIES } from "./Const";
import { DependentProps } from "./DependentProps";
import { StateBaseHandler } from "./StateBaseHandler"
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";
import { State, Proxies } from "./types";


// todo: HTMLElementをComponentに変更
export function getProxies(component:HTMLElement, state:Object):Proxies {
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(Reflect.get(state, DEPENDENCIES) ?? {});
  return {
    base: new Proxy<Object>(state, new StateBaseHandler(component, accessorProperties, dependencies)) as State,
    write: new Proxy<Object>(state, new StateWriteHandler(component, accessorProperties, dependencies)) as State,
    readonly: new Proxy<Object>(state, new StateReadOnlyHandler(component, accessorProperties, dependencies)) as State,
  }
}
