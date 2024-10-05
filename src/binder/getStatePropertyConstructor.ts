import { ContextIndex } from "../binding/stateProperty/ContextIndex";
import { StateProperty } from "../binding/stateProperty/StateProperty";
import { IBinding, IStateProperty } from "../binding/types";
import { IFilterText } from "../filter/types";
import { StatePropertyConstructor } from "./types";

const regexp = RegExp(/^\$[0-9]+$/);

const createStateProperty = 
(StatePropertyConstructor:typeof StateProperty):StatePropertyConstructor =>
(binding:IBinding, name:string, filters:IFilterText[]):IStateProperty => 
{
  return Reflect.construct(StatePropertyConstructor, [binding, name, filters]);
}

/**
 * バインドのステートプロパティのコンストラクタを取得する
 * @param propertyName 
 * @returns {StatePropertyConstructor} ステートプロパティのコンストラクタ
 */
export function getStatePropertyConstructor(
  propertyName: string
): StatePropertyConstructor {
  const statePropertyConstructor = regexp.test(propertyName) ? ContextIndex : StateProperty;
  return createStateProperty(statePropertyConstructor);
}
