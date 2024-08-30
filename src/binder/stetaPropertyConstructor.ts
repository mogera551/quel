import { ContextIndex } from "../binding/stateProperty/ContextIndex";
import { StateProperty } from "../binding/stateProperty/StateProperty";
import { INewBinding, INewStateProperty } from "../binding/types";
import { IFilterInfo } from "../@types/filter";
import { StatePropertyCreator } from "../@types/binder";

const regexp = RegExp(/^\$[0-9]+$/);

const createStateProperty = 
(StatePropertyConstructor:typeof StateProperty):StatePropertyCreator =>
(binding:INewBinding, name:string, filters:IFilterInfo[]):INewStateProperty => 
{
  return Reflect.construct(StatePropertyConstructor, [binding, name, filters]);
}

export function getStatePropertyConstructor(propertyName:string) {
  const statePropertyConstructor = regexp.test(propertyName) ? ContextIndex : StateProperty;
  return createStateProperty(statePropertyConstructor);
}
