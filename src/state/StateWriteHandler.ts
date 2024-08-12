import { utils } from "../utils";
import { ILoopContext } from "../@types/loopContext";
import { IDirectlyCallContext, IState } from "../@types/state";
import { PropertyAccess } from "../binding/PropertyAccess";
import { getPatternNameInfo } from "../dot-notation/PatternName";
import { Api } from "./Api";
import { Callback } from "./Callback";
import { DirectlyCallContext } from "./DirectlyCallContext";
import { SpecialProp } from "./SpecialProp";
import { StateBaseHandler } from "./StateBaseHandler";

export class StateWriteHandler extends StateBaseHandler {
  #directlyCallContext:IDirectlyCallContext = new DirectlyCallContext;

  /**
   * プロパティ情報からViewModelの値を取得する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}  
   * @param {Proxy} receiver 
   */
  getByPatternNameAndIndexes(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:IState) {
    const patterNameInfo = getPatternNameInfo(patternName);
    if (!patterNameInfo.isPrimitive) {
      !this.dependencies.hasDefaultProp(patterNameInfo.name) && this.dependencies.addDefaultProp(patterNameInfo.name);
    }
    return (SpecialProp.has(patternName)) ?
      SpecialProp.get(this.component, target, patternName):
      super.getByPatternNameAndIndexes(target, { patternName, indexes }, receiver)
    ;
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   */
  setByPatternNameAndIndexes(target:Object, { patternName, indexes, value }:{patternName:string, indexes:number[], value:any}, receiver:IState) {
    const patterNameInfo = getPatternNameInfo(patternName);
    if (!patterNameInfo.isPrimitive) {
      !this.dependencies.hasDefaultProp(patternName) && this.dependencies.addDefaultProp(patternName);
    }
    const result = super.setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver);
    this.addNotify(target, new PropertyAccess(patternName, indexes), receiver);

    return result;
  }

  async directlyCallback(loopContext:ILoopContext, directlyCallback:()=>Promise<void>):Promise<void> {
    return this.#directlyCallContext.callback(loopContext, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      this.stackIndexes.push(undefined);
      try {
        return await directlyCallback();
      } finally {
        this.stackIndexes.pop();
      }
    });
  }

  #findLoopContext(prop:string):ILoopContext|undefined {
    if (typeof this.#directlyCallContext.loopContext === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const patternNameInfo = getPatternNameInfo(prop);
    if (patternNameInfo.level === 0 || prop.at(0) === "@") return;
    const wildcardPatternNameInfo = getPatternNameInfo(patternNameInfo.wildcardNames[patternNameInfo.wildcardNames.length - 1]);
    const loopContext = this.#directlyCallContext.loopContext.find(wildcardPatternNameInfo.parentPath);
    if (typeof loopContext === "undefined") utils.raise(`WritableViewModelHandler: ${prop} is outside loop`);
    return loopContext;
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {Proxy} receiver 
   * @returns {any}
   */
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
}