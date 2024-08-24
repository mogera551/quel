import { ContextIndex } from "../newBinding/stateProperty/ContextIndex";
import { StateProperty } from "../newBinding/stateProperty/StateProperty";
import { INewBinding, INewStateProperty } from "../newBinding/types";
import { IFilterInfo } from "../@types/filter";
import { StatePropertyCreator } from "./types";

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
