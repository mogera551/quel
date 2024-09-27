import { getValue as _getValue } from "../dotNotation/getValue";
import { GetValueFn } from "../dotNotation/types";
import { Handler } from "./Handler";

type IHandlerPartial = Pick<Handler, "dependentProps"|"getValue">;

export const getValueByStateHandler = (handler:IHandlerPartial): GetValueFn => {
  return function _getValueByStateHandler(
    target: object, 
    patternPaths: string[],
    patternElements: string[],
    wildcardIndexes: (number|undefined)[], 
    pathIndex: number, 
    wildcardIndex: number,
    receiver: object, 
  ):any {
    const dependentProps = handler.dependentProps;
    const getValue = _getValue(handler)
    if (patternPaths.length > 1) {
      dependentProps.setDefaultProp(patternPaths[pathIndex]);
    }
    return getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
  }
}