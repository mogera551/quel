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
    // ToDo: 実装する
    return [];
  }
  
  __set(target:object, propInfo:IPropInfo, indexes:(number|undefined)[], value:any, receiver:IStateProxy):boolean {
    try {
      return super.__set(target, propInfo, indexes, value, receiver);
    } finally {
      this.updator.addUpdatedStateProperty(new PropertyAccess(propInfo.pattern, indexes as number[]));
    }
  }
/*
  #findLoopContext(prop:string):ILoopContext|undefined {
    if (typeof this.#directlyCallContext.loopContext === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const patternNameInfo = getPatternNameInfo(prop);
    if (patternNameInfo.level === 0 || prop.at(0) === "@") return;
    const wildcardPatternNameInfo = getPatternNameInfo(patternNameInfo.wildcardNames[patternNameInfo.wildcardNames.length - 1]);
    const loopContext = this.#directlyCallContext.loopContext.find(wildcardPatternNameInfo.parentPath);
    if (typeof loopContext === "undefined") utils.raise(`StateWriteHandler: ${prop} is outside loop`);
    return loopContext;
  }

  get(target:Object, prop:PropertyKey, receiver:IState):any {
    if (typeof prop === "symbol") {
      const supportCallbackSymbol = Callback.getSupportSymbol(prop);
      if (typeof supportCallbackSymbol !== "undefined") {
        return Callback.get(target, receiver, this, supportCallbackSymbol);
      }
      const supportApiSymbol = Api.getSupportSymbol(prop);
      if (typeof supportApiSymbol !== "undefined") {
        return Api.get(target, receiver, this, supportApiSymbol);
      }
    }
    if (typeof prop !== "string") return super.get(target, prop, receiver);
    const loopContext = this.#findLoopContext(prop);
    return (typeof loopContext !== "undefined") ?
      this.getDirect(target, { patternName:prop, indexes:loopContext.allIndexes}, receiver) :
      super.get(target, prop, receiver);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:IState):boolean {
    if (typeof prop !== "string") return super.set(target, prop, value, receiver);
    const loopContext = this.#findLoopContext(prop);
    return (typeof loopContext !== "undefined") ?
      this.setDirect(target, { patternName:prop, indexes:loopContext.allIndexes, value}, receiver) :
      super.set(target, prop, value, receiver);
  }
*/
}