import { NotifyCallbackFn } from "../dotNotation/types";
import { ILoopIndexes } from "../loopContext/types";
import { createStatePropertyAccessor } from "./createStatePropertyAccessor";
import { IStateHandler } from "./types";

type IHandlerPartial = Pick<IStateHandler, "updator">

export const notifyCallbackFn = (handler: IHandlerPartial): NotifyCallbackFn => {
  return function(
    pattern: string,
    loopIndexes: ILoopIndexes | undefined
  ): void {
    handler.updator.addUpdatedStateProperty(createStatePropertyAccessor(pattern, loopIndexes));
  }
}