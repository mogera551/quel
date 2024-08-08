import { IComponent } from "../component/types";
import { getAccessorProperties } from "./AccessorProperties"
import { DEPENDENCIES } from "./Const";
import { DependentProps } from "./DependentProps";
import { StateBaseHandler } from "./StateBaseHandler"
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";
import { IState, Proxies } from "./types";

export function getProxies(component:IComponent, state:Object):Proxies {
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(Reflect.get(state, DEPENDENCIES) ?? {});
  return {
    base: new Proxy<Object>(state, new StateBaseHandler(component, accessorProperties, dependencies)) as IState,
    write: new Proxy<Object>(state, new StateWriteHandler(component, accessorProperties, dependencies)) as IState,
    readonly: new Proxy<Object>(state, new StateReadOnlyHandler(component, accessorProperties, dependencies)) as IState,
  }
}
