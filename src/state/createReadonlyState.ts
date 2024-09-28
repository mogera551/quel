import { StateCache } from "../dotNotation/types";
import { utils } from "../utils";
import { Handler } from "./Handler";
import { IComponentForHandler, IReadonlyStateHandler, IStateProxy } from "./types";

class ReadonlyHandler extends Handler implements IReadonlyStateHandler {
  // MapよりObjectのほうが速かった。keyにconstructorやlengthがある場合は、Mapを選択
  cache: StateCache = {};
  
  set(
    target: object, 
    prop: string, 
    value: any, 
    receiver: object
  ): boolean {
    utils.raise("ReadonlyHandler: set is not allowed");
  }
}

export function createReadonlyState(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new ReadonlyHandler(component, base)) as IStateProxy;
}
