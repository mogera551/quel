import { IDotNotationHandler, IPropInfo } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "stackNamedWildcardIndexes"|"stackIndexes"|"getValue"|"withIndexes">;
export const getValueWithIndexes = (handler: IHandlerPartial) => {
  return function(
    target:object, 
    propInfo:IPropInfo, 
    indexes:(number|undefined)[], 
    receiver:object
  ): any {
    return handler.withIndexes(
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
