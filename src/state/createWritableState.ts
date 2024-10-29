import { NotifyCallbackFn } from "./types";
import { Handler } from "./Handler";
import { notifyCallbackFn } from "./notifyCallbackFn";
import { IComponentForHandler, IStateProxy, IWritableStateHandler } from "./types";

class WritableHandler extends Handler implements IWritableStateHandler {

  notifyCallback: NotifyCallbackFn = notifyCallbackFn(this);
}

export function createWritableState(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new WritableHandler(component, base)) as IStateProxy;
}