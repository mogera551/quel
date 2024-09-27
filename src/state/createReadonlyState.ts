import { GetValueFn } from "../dotNotation/types";
import { utils } from "../utils";
import { getValueByReadonlyStateHandler } from "./getValueByReadonlyStateHandler";
import { Handler } from "./Handler";
import { IComponentForHandler, IReadonlyStateHandler, IStateProxy } from "./types";

class ReadonlyHandler extends Handler implements IReadonlyStateHandler {
  // MapよりObjectのほうが速かった。keyにconstructorやlengthがある場合は、Mapを選択
  #cache: {[key: string]: any} = {};
  get cache(): {[key: string]: any} {
    return this.#cache;
  }
  
  getValue: GetValueFn = getValueByReadonlyStateHandler(this);

  clearCache():void {
    this.#cache = {};
  }

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
