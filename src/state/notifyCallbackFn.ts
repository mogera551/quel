import { createPropertyAccess } from "../binding/createPropertyAccess";
import { CleanIndexes, NotifyCallbackFn } from "../dotNotation/types";
import { IStateHandler, IWritableStateHandler } from "./types";

type IHandlerPartial = Pick<IStateHandler, "updator">

export const notifyCallbackFn = (handler: IHandlerPartial): NotifyCallbackFn => {
  return function(
    pattern: string,
    indexes: CleanIndexes
  ): void {
    handler.updator.addUpdatedStateProperty(createPropertyAccess(pattern, indexes));
  }
}