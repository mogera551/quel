import { IComponent } from "../@types/component";
import { IState, Proxies } from "../@types/state";
import { DEPENDENCIES } from "./Const";
import { getAccessorProperties } from "./AccessorProperties"
import { DependentProps } from "./DependentProps";
import { StateReadOnlyHandler } from "./StateReadOnlyHandler";
import { StateWriteHandler } from "./StateWriteHandler";

export function getProxies(component:IComponent, State:typeof Object):Proxies {
  const state = Reflect.construct(State, []);
  const accessorProperties = new Set(getAccessorProperties(state));
  const dependencies:DependentProps = new DependentProps(Reflect.get(state, DEPENDENCIES) ?? {});
  return {
    base: state,
    write: new Proxy<Object>(state, new StateWriteHandler(component, accessorProperties, dependencies)) as IState,
    readonly: new Proxy<Object>(state, new StateReadOnlyHandler(component, accessorProperties, dependencies)) as IState,
  }
}
