import { getPropInfo } from "./getPropInfo";
import { IDotNotationHandler, SetValueWithoutIndexesFn } from "./types";
import { setValueWithIndexesFn, IHandlerPartialForSetValueWithIndexes } from "./setValueWithIndexesFn";

type IHandlerPartial = Pick<IDotNotationHandler, "getLastIndexes">;

export type IHandlerPartialForSetValueWithoutIndexes = IHandlerPartial & IHandlerPartialForSetValueWithIndexes;

export const setValueWithoutIndexesFn = (handler: IHandlerPartialForSetValueWithoutIndexes): SetValueWithoutIndexesFn => {
  const setValueWithIndexes = setValueWithIndexesFn(handler);
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
    return setValueWithIndexes(target, propInfo, wildcardIndexes, value, receiver);
  }
}
