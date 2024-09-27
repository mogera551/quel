import { GetValueWithIndexesFn, IDotNotationHandler, IPropInfo } from "./types";
import { withIndexes as _withIndexes } from "./withIndexes";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes"|"getValue">;
export const getValueWithIndexes = (handler: IHandlerPartial): GetValueWithIndexesFn => {
  return function(
    target:object, 
    propInfo:IPropInfo, 
    indexes:(number|undefined)[], 
    receiver:object
  ): any {
    const withIndexes = _withIndexes(handler);
    return withIndexes(
      propInfo, 
      indexes, 
      () => {
        return handler.getValue(
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
