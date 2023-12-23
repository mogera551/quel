import "../types.js"
import { Callback } from "./Callback.js";
import { Api } from "./Api.js";
import { utils } from "../utils.js";
import { ViewModelHandlerBase } from "./ViewModelHandlerBase.js";
import { SpecialProp } from "./SpecialProp.js";
import { Cache } from "./Cache.js";

/**
 * キャッシュが利用可能なViewModelのProxyハンドラ
 * 書き込みはエラー
 */
export class ReadOnlyViewModelHandler extends ViewModelHandlerBase {
  /** @type {Cache} */
  #cache = new Cache;
  get cache() {
    return this.#cache;
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
    if (SpecialProp.has(propName.name)) {
      return SpecialProp.get(this.component, target, propName.name);
    } else {
      if (!propName.isPrimitive || this.setOfAccessorProperties.has(propName.name)) {
          // プリミティブじゃないもしくはアクセサプロパティ場合、キャッシュから取得する
        const indexes = propName.level > 0 ? this.lastIndexes.slice(0, propName.level) : [];
        let value = this.#cache.get(propName, indexes);
        if (typeof value === "undefined") {
          value = super.getByPropertyName(target, { propName }, receiver);
          this.#cache.set(propName, indexes, value);
        }
        return value;
      } else {
        return super.getByPropertyName(target, { propName }, receiver);
      }
    }
  }

  /**
   * プロパティ情報からViewModelの値を設定する
   * @param {ViewModel} target 
   * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName,value:any}}  
   * @param {Proxy} receiver 
   */
  setByPropertyName(target, { propName, value }, receiver) {
    utils.raise("ReadOnlyViewModelHandler: viewModel is read only");
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
      return super.get(target, prop, receiver);
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
    utils.raise("ReadOnlyViewModelHandler: viewModel is read only");
  }
}
