import { createPropertyAccess } from "../binding/createPropertyAccess";
import { Indexes, IPropInfo, SetValueWithIndexesFn } from "../dotNotation/types";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { getLastIndexesByWritableStateHandler } from "./getLastIndexesByWritableStateHandler";
import { Handler } from "./Handler";
import { setValueWithIndexesByWritableStateHandler } from "./setValueWithIndexesByWritableStateHandler";
import { IComponentForHandler, IStateProxy, IWritableStateHandler } from "./types";

class WritableHandler extends Handler implements IWritableStateHandler {
  #loopContext?: ILoopContext;
  #setLoopContext: boolean = false;
  get loopContext(): ILoopContext | undefined {
    return this.#loopContext;
  }

  async withLoopContext(
    loopContext: ILoopContext | undefined, // 省略ではなくundefinedを指定する、callbackを省略させないため
    callback: ()=> Promise<void>
  ): Promise<void> {
    if (this.#setLoopContext) utils.raise("Writable: already set loopContext");
    this.#setLoopContext = true;
    this.#loopContext = loopContext;
    try {
      return await callback();
    } finally {
      this.#setLoopContext = false;
      this.#loopContext = undefined;
    }
  }

  async directlyCallback(
    loopContext: ILoopContext | undefined, 
    callback: () => Promise<void>
  ): Promise<void> {
    return await this.withLoopContext(loopContext, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      if (typeof this.lastStackIndexes !== "undefined") utils.raise("Writable: already set stackIndexes");
      return await callback();
    });
  }

  getLastIndexes = getLastIndexesByWritableStateHandler(this);
  
  setValueWithIndexes: SetValueWithIndexesFn = setValueWithIndexesByWritableStateHandler(this);
}

export function createWritableState(
  component: IComponentForHandler, 
  base: object
): IStateProxy {
  return new Proxy(base, new WritableHandler(component, base)) as IStateProxy;
}