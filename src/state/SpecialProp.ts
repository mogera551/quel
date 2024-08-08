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
  [name:string]:({component, state}:{component:HTMLElement, state:Object}) => any
}

const funcByName:FuncByName = {
  // todo: componentをHTMLElementからComponentに変更
  // todo: undefinedを返すからcomponent.globalsを返すように変更
  [GLOBALS_PROPERTY]: ({component}:{component:HTMLElement, state:Object}) => undefined, // component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({state}:{component:HTMLElement, state:Object}) => Reflect.get(state, DEPENDENT_PROPS_PROPERTY),
  // todo: componentをHTMLElementからComponentに変更
  // todo: undefinedを返すからcreateUserComponent(component)を返すように変更
  [COMPONENT_PROPERTY]: ({component}:{component:HTMLElement, state:Object}) => undefined, // createUserComponent(component),
}

export class SpecialProp {
  static get(component:HTMLElement, state:Object, name:string):any {
    return funcByName[name]?.({component, state}) ?? utils.raise(`SpecialProp: ${name} is not found`);
  }

  static has(name:string) {
    return properties.has(name);
  }
}