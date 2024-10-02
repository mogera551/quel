import { NotifyCallbackFn } from "../dotNotation/types";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { getLastIndexesFnByWritableStateHandler } from "./getLastIndexesFnByWritableStateHandler";
import { Handler } from "./Handler";
import { notifyCallbackFn } from "./notifyCallbackFn";
import { IComponentForHandler, IStateProxy, IWritableStateHandler } from "./types";

class WritableHandler extends Handler implements IWritableStateHandler {

  getLastIndexes = getLastIndexesFnByWritableStateHandler(this);
  
  notifyCallback: NotifyCallbackFn = notifyCallbackFn(this);
}

export function createWritableState(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new WritableHandler(component, base)) as IStateProxy;
}