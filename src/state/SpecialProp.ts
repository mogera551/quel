import { IComponent } from "../@types/component";
import { utils } from "../utils";

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";

export const properties = new Set([
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  COMPONENT_PROPERTY,
]);

type FuncByName = {
  [name:string]:({component, state}:{component:IComponent, state:Object}) => any
}

const funcByName:FuncByName = {
  // todo: undefinedを返すからcomponent.globalsを返すように変更
  [GLOBALS_PROPERTY]: ({component}:{component:IComponent, state:Object}) => undefined, // component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({state}:{component:IComponent, state:Object}) => Reflect.get(state, DEPENDENT_PROPS_PROPERTY),
  // todo: undefinedを返すからcreateUserComponent(component)を返すように変更
  [COMPONENT_PROPERTY]: ({component}:{component:IComponent, state:Object}) => undefined, // createUserComponent(component),
}

export class SpecialProp {
  static get(component:IComponent, state:Object, name:string):any {
    return funcByName[name]?.({component, state}) ?? utils.raise(`SpecialProp: ${name} is not found`);
  }

  static has(name:string) {
    return properties.has(name);
  }
}