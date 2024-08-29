import { utils } from "../utils";
import { createUserComponent } from "../newComponent/UserProxy";
import { IStateHandler, IStateProxy } from "./types";
import { INewComponent } from "../newComponent/types";

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";

export const properties = new Set([
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  COMPONENT_PROPERTY,
]);

type FuncByName = {
  [name:string]:({component, state}:{component:INewComponent, state:Object}) => any
}

const funcByName:FuncByName = {
  [GLOBALS_PROPERTY]: ({component}:{component:INewComponent, state:Object}) => component.globals, // component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({state}:{component:INewComponent, state:Object}) => Reflect.get(state, DEPENDENT_PROPS_PROPERTY),
  [COMPONENT_PROPERTY]: ({component}:{component:INewComponent, state:Object}) => createUserComponent(component),
}

export function getSpecialProps(state:Object, stateProxy:IStateProxy, handler:IStateHandler, prop:string):any {
  return funcByName[prop]?.({component:handler.component, state});
}

export class SpecialProp {
  static get(component:INewComponent, state:Object, name:string):any {
    return funcByName[name]?.({component, state}) ?? utils.raise(`SpecialProp: ${name} is not found`);
  }

  static has(name:string) {
    return properties.has(name);
  }
}