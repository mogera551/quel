import { GetValueWithIndexesFn, IPropInfo } from "./types";
import { withIndexesFn, IHandlerPartialForWithIndexes } from "./withIndexesFn";
import { getValueFn, IHandlerPartialForGetValue } from "./getValueFn";

export type IHandlerPartialForGetValueWithIndexes = IHandlerPartialForGetValue & IHandlerPartialForWithIndexes;

export const getValueWithIndexesFn = (handler: IHandlerPartialForGetValueWithIndexes): GetValueWithIndexesFn => {
  const withIndexes = withIndexesFn(handler);
  const getValue = getValueFn(handler);
  return function(
    target:object, 
    propInfo:IPropInfo, 
    indexes:(number|undefined)[], 
    receiver:object
  ): any {
    return withIndexes(
      propInfo, 
      indexes, 
      () => {
        return getValue(
          target, 
          propInfo.patternPaths,
          propInfo.patternElements, 
          indexes, 
          propInfo.paths.length - 1, 
          propInfo.wildcardCount - 1, 
          receiver);
      }
    );
  };
}
