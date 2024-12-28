import { NotifyCallbackFn } from "./types";
import { ILoopIndexes } from "../loopContext/types";
import { createStatePropertyAccessor } from "./createStatePropertyAccessor";
import { IStateHandler } from "./types";

type IHandlerPartial = Pick<IStateHandler, "updater">

export const notifyCallbackFn = (handler: IHandlerPartial): NotifyCallbackFn => {
  return function(
    pattern: string,
    loopIndexes: ILoopIndexes | undefined
  ): void {
    handler.updater.addUpdatedStateProperty(createStatePropertyAccessor(pattern, loopIndexes));
  }
}