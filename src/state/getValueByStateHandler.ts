import { getValue as _getValue } from "../dotNotation/getValue";
import { GetValueFn } from "../dotNotation/types";
import { Handler } from "./Handler";

type IHandlerPartial = Pick<Handler, "dependentProps"|"getValue">;

export const getValueByStateHandler = (handler:IHandlerPartial): GetValueFn => {
  const getValue = _getValue(handler);
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
    const path = patternPaths[pathIndex];
    if (patternPaths.length > 1 && !dependentProps.defaultProps.has(path)) {
      dependentProps.setDefaultProp(path);
    }
    return getValue(target, patternPaths, patternElements, wildcardIndexes, pathIndex, wildcardIndex, receiver);
  }
}