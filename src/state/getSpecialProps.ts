import { createUserComponent } from "../component/UserProxy";
import { IStateHandler, IStateProxy } from "./types";
import { IComponent } from "../component/types";

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";
const ADD_PROCESS_PROPERTY = "$addProcess";

export const properties = new Set([
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  COMPONENT_PROPERTY,
  ADD_PROCESS_PROPERTY,
]);

type State = { [key:string]: any };

type FuncArgs = {state:State, stateProxy:IStateProxy, handler:IStateHandler, prop:string};

type FuncInterface = (args:FuncArgs) => any;

type FuncByName = {
  [name:string]: FuncInterface
}


const funcByName:FuncByName = {
  [GLOBALS_PROPERTY]: ({handler}:FuncArgs) => (handler.element as IComponent).globals, // component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({state}:FuncArgs) => state[DEPENDENT_PROPS_PROPERTY],
  [COMPONENT_PROPERTY]: ({handler}:FuncArgs) => createUserComponent((handler.element as IComponent)),
  [ADD_PROCESS_PROPERTY]: ({handler, stateProxy}:FuncArgs) => (func:Function) => handler.updator.addProcess(func, stateProxy, [])
}

export function getSpecialProps(
  state: State, 
  stateProxy: IStateProxy, 
  handler: IStateHandler, 
  prop: string
): any {
  return funcByName[prop]?.({state, stateProxy, handler, prop});
}

