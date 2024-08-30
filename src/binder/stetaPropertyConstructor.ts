import { ContextIndex } from "../binding/stateProperty/ContextIndex";
import { StateProperty } from "../binding/stateProperty/StateProperty";
import { IBinding, IStateProperty } from "../binding/types";
import { IFilterInfo } from "../filter/types";
import { StatePropertyCreator } from "./types";

const regexp = RegExp(/^\$[0-9]+$/);

const createStateProperty = 
(StatePropertyConstructor:typeof StateProperty):StatePropertyCreator =>
(binding:IBinding, name:string, filters:IFilterInfo[]):IStateProperty => 
{
  return Reflect.construct(StatePropertyConstructor, [binding, name, filters]);
}

export function getStatePropertyConstructor(propertyName:string) {
  const statePropertyConstructor = regexp.test(propertyName) ? ContextIndex : StateProperty;
  return createStateProperty(statePropertyConstructor);
}
