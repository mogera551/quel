import { GetValueWithIndexesFn, IDotNotationHandler, IPropInfo } from "./types";
import { withIndexes as _withIndexes } from "./withIndexes";
import { getValue as _getValue } from "./getValue";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes"|"cache"|"findPropertyCallback">;
export const getValueWithIndexes = (handler: IHandlerPartial): GetValueWithIndexesFn => {
  const withIndexes = _withIndexes(handler);
  const getValue = _getValue(handler);
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
