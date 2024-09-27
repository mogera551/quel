import { getPropInfo } from "./getPropInfo";
import { IDotNotationHandler, SetValueWithoutIndexesFn } from "./types";

type IHandlerPartial = Pick<IDotNotationHandler, "getLastIndexes"|"setValueWithIndexes"|"stackNamedWildcardIndexes"|"stackIndexes"|"getValue">;

export const setValueWithoutIndexes = (handler: IHandlerPartial): SetValueWithoutIndexesFn => {
  return function (
    target: object, 
    prop: string, 
    value: any, 
    receiver: object
  ): boolean {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = handler.getLastIndexes(propInfo.wildcardPaths[propInfo.wildcardPaths.length - 1] ?? "") ?? [];
    const wildcardIndexes = 
      propInfo.allComplete ? propInfo.wildcardIndexes :
      propInfo.allIncomplete ? lastStackIndexes :
      propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return handler.setValueWithIndexes(target, propInfo, wildcardIndexes, value, receiver);
  }
}
