import { IComponent } from "../@types/component";
import { getAccessorProperties } from "./AccessorProperties"
import { DEPENDENCIES } from "./Const";
import { DependentProps } from "./DependentProps";
import { StateBaseHandler } from "./StateBaseHandler"
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";
import { IState, Proxies } from "../@types/state";

export function getProxies(component:IComponent, State:typeof Object):Proxies {
  const state = Reflect.construct(State, []);
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(Reflect.get(state, DEPENDENCIES) ?? {});
  return {
    base: new Proxy<Object>(state, new StateBaseHandler(component, accessorProperties, dependencies)) as IState,
    write: new Proxy<Object>(state, new StateWriteHandler(component, accessorProperties, dependencies)) as IState,
    readonly: new Proxy<Object>(state, new StateReadOnlyHandler(component, accessorProperties, dependencies)) as IState,
  }
}
