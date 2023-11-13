import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../Symbols.js";
import { utils } from "../utils.js";
import { Api } from "./Api.js";
import { Callback } from "./Callback.js";
import { DirectlyCallContext } from "./DirectlyCallContext.js";
import { SpecialProp } from "./SpecialProp.js";
import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";

export class WritableViewModelHandler extends ViewModelHandlerBase {
  /** @type {DirectlyCallContext} */
  #directlyCallContext = new DirectlyCallContext;
  get directlyCallContext() {
    return this.#directlyCallContext;
  }

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

  async directlyCallback(context, directlyCallback) {
    return this.directlyCallContext.callback(context, async () => {
      // directlyCallの場合、引数で$1,$2,...を渡す
      // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
      // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
      this.stackIndexes.push(undefined);
      try {
        return directlyCallback();
      } finally {
        this.stackIndexes.pop();
      }
    });
  }

  /**
   * 
   * @param {string} prop 
   * @returns {ContextParam | undefined}
   */
  findParam(prop) {
    if (typeof this.directlyCallContext.context === "undefined") return;
    if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor") return;
    const propName = PropertyName.create(prop);
    if (propName.level === 0 || prop.at(0) === "@") return;
    const param = this.directlyCallContext.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
    if (typeof param === "undefined") utils.raise(`${prop} is outside loop`);
    return param;
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
      const contextParam = this.findParam(prop);
      return (typeof contextParam !== "undefined") ?
        this.directlyGet(target, { prop, indexes:contextParam.indexes}, receiver) :
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
    const contextParam = this.findParam(prop);
    return (typeof contextParam !== "undefined") ?
      this.directlySet(target, { prop, indexes:contextParam.indexes, value}, receiver) :
      super.set(target, prop, value, receiver);
  }

}
