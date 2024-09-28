import { getPropInfo } from "./getPropInfo";
import { GetValueWithoutIndexesFn, IDotNotationHandler } from "./types";
import { getValueWithIndexes as _getValueWithIndexes, IHandlerPartialForGetValueWithIndexes } from "./getValueWithIndexes";

type IHandlerPartial = Pick<IDotNotationHandler, "getLastIndexes">;

export type IHandlerPartialForGetValueWithoutIndexes = IHandlerPartial & IHandlerPartialForGetValueWithIndexes;

export const getValueWithoutIndexes = (handler: IHandlerPartialForGetValueWithoutIndexes): GetValueWithoutIndexesFn => {
  const getValueWithIndexes = _getValueWithIndexes(handler);
  return function (target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = handler.getLastIndexes(propInfo.wildcardPaths[propInfo.wildcardPaths.length - 1] ?? "") ?? [];
    const wildcardIndexes = 
      propInfo.allComplete ? propInfo.wildcardIndexes :
      propInfo.allIncomplete ? lastStackIndexes :
      propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    return getValueWithIndexes(target, propInfo, wildcardIndexes, receiver);
  };

}
