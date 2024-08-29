import { PropertyAccess } from "../newBinding/PropertyAccess";
import { getPropInfo } from "../newDotNotation/PropInfo";
import { Indexes, IPropInfo } from "../newDotNotation/types";
import { INewLoopContext } from "../newLoopContext/types";
import { utils } from "../utils";
import { Handler } from "./Handler";
import { IStateProxy } from "./types";

export class WritableHandler extends Handler {
  #loopContext:INewLoopContext|undefined;
  async withLoopContext(loopContext:INewLoopContext, callback:()=>Promise<void>):Promise<void> {
    if (typeof this.#loopContext !== "undefined") utils.raise("Writable: already set loopContext");
    this.#loopContext = loopContext;
    try {
      return await callback();
    } finally {
      this.#loopContext = undefined;
    }
  }

  async directlyCallback(loopContext:INewLoopContext, callback:()=>Promise<void>):Promise<void> {
    return this.withLoopContext(loopContext, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      if (typeof this.lastStackIndexes !== "undefined") utils.raise("Writable: already set stackIndexes");
      return await callback();
    });
  }

  getLastIndexes(pattern: string): Indexes {
    return this._stackNamedWildcardIndexes.at(-1)?.[pattern]?.indexes ?? this.#loopContext?.find(pattern)?.indexes ?? [];
  }
  
  __set(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], value:any, receiver:IStateProxy):boolean {
    try {
      return super.__set(target, propInfo, indexes, value, receiver);
    } finally {
      this.updator.addUpdatedStateProperty(new PropertyAccess(propInfo.pattern, indexes as number[]));
    }
  }
}