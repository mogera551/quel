import { getPropInfo } from "./getPropInfo";
import { IDotNotationHandler } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "getValueWithIndexes"|"getLastIndexes"|"stackNamedWildcardIndexes"|"stackIndexes"|"getValue">;
export const getValueWithoutIndexes = (handler: IHandlerPartial) => {
  return function (target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = handler.getLastIndexes(propInfo.wildcardPaths[propInfo.wildcardPaths.length - 1] ?? "") ?? [];
    const wildcardIndexes = 
      propInfo.allComplete ? propInfo.wildcardIndexes :
      propInfo.allIncomplete ? lastStackIndexes :
      propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return handler.getValueWithIndexes(target, propInfo, wildcardIndexes, receiver);
  };

}
