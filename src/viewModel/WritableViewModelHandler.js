import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../Symbols.js";
import { LoopContext } from "../loopContext/LoopContext.js";
import { utils } from "../utils.js";
import { Api } from "./Api.js";
import { Callback } from "./Callback.js";
import { DirectlyCallContext } from "./DirectlyCallContext.js";
import { SpecialProp } from "./SpecialProp.js";
import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";

/**
 * 書き込み可能なViewModelのProxyハンドラ
 * 書き込み時、＄writeCallbacを実行し、更新通知を投げる
 */
export class WritableViewModelHandler extends ViewModelHandlerBase {
  /** @type {DirectlyCallContext} */
  #directlyCallContext = new DirectlyCallContext;

  /**
   * プロパティ情報からViewModelの値を取得する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}  
   * @param {Proxy} receiver 
   */
  getByPropertyName(target, { propName }, receiver) {
    if (!propName.isPrimitive) {
      !this.dependentProps.hasDefaultProp(propName.name) && this.dependentProps.addDefaultProp(propName.name);
    }
    return (SpecialProp.has(propName.name)) ?
      SpecialProp.get(this.component, target, propName.name):
      super.getByPropertyName(target, { propName }, receiver)
    ;
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,value:any}}  
   * @param {Proxy} receiver 
   */
  setByPropertyName(target, { propName, value }, receiver) {
    if (!propName.isPrimitive) {
      !this.dependentProps.hasDefaultProp(propName.name) && this.dependentProps.addDefaultProp(propName.name);
    }
    const result = super.setByPropertyName(target, { propName, value }, receiver);
    const indexes = this.lastIndexes;
    receiver[Symbols.writeCallback](propName.name, indexes);
    this.addNotify(target, { propName, indexes }, receiver);

    return result;
  }

  /**
   * 
   * @param {LoopContext} loopContext 
   * @param {()=>Promise} directlyCallback 
   * @returns {Promise}
   */
  async directlyCallback(loopContext, directlyCallback) {
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

  /**
   * 
   * @param {string} prop 
   * @returns {LoopContext | undefined}
   */
  findLoopContext(prop) {
    if (typeof this.#directlyCallContext.loopContext === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const propName = PropertyName.create(prop);
    if (propName.level === 0 || prop.at(0) === "@") return;
    const loopContext = this.#directlyCallContext.loopContext.find(propName.nearestWildcardParentName);
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
  get(target, prop, receiver) {
    if (Callback.has(prop)) {
      return Callback.get(target, receiver, this, prop);
    } else if (Api.has(prop)) {
      return Api.get(target, receiver, this, prop);
    } else {
      const loopContext = this.findLoopContext(prop);
      return (typeof loopContext !== "undefined") ?
        this.directlyGet(target, { prop, indexes:loopContext.indexes}, receiver) :
        super.get(target, prop, receiver);
    }
  }

  /**
   * 
   * @param {ViewModel} target 
   * @param {string} prop 
   * @param {any} value 
   * @param {Proxy} receiver 
   * @returns {boolean}
   */
  set(target, prop, value, receiver) {
    const loopContext = this.findLoopContext(prop);
    return (typeof loopContext !== "undefined") ?
      this.directlySet(target, { prop, indexes:loopContext.indexes, value}, receiver) :
      super.set(target, prop, value, receiver);
  }

}
