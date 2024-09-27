import { createPropertyAccess } from "../binding/createPropertyAccess";
import { setValueWithIndexes as _setValueWithIndexes } from "../dotNotation/setValueWithIndexes";
import { IPropInfo, SetValueWithIndexesFn } from "../dotNotation/types";
import { Handler } from "./Handler";

type IHandlerPartial = Pick<Handler, "stackNamedWildcardIndexes"|"stackIndexes"|"getValue"|"updator">;

export const setValueWithIndexesByWritableStateHandler = (handler: IHandlerPartial): SetValueWithIndexesFn => {
  return function(
    target: object, 
    propInfo: IPropInfo, 
    indexes: (number|undefined)[], 
    value: any, 
    receiver: object
  ) {
    const setValueWithIndexes = _setValueWithIndexes(handler);
    try {
      return setValueWithIndexes(target, propInfo, indexes, value, receiver);
    } finally {
      handler.updator.addUpdatedStateProperty(createPropertyAccess(propInfo.pattern, indexes as number[]));
    }
  };
}
