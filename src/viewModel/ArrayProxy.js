import Component from "../component/Component.js";
import { NotifyData } from "../thread/Notifier.js";
import PropertyInfo from "./PropertyInfo.js";
import { SYM_GET_IS_PROXY, SYM_GET_RAW } from "./Symbols.js";

/**
 * 配列プロキシ
 * 更新（追加・削除）があった場合、更新通知を送る機能を付加する
 */
class ArrayHandler {
  /**
   * @type {Component}
   */
  #component;
  /**
   * @type {PropertyInfo}
   */
  #prop;
  /**
   * ループインデックス
   * @type {integer[]}
   */
  #indexes;
  /**
   * コンストラクタ
   * @param {Component} component 
   * @param {string} prop 
   * @param {integer[]} indexes
   */
  constructor(component, prop, indexes) {
    this.#component = component;
    this.#prop = prop;
    this.#indexes = indexes;
  }

  /**
   * getter
   * SymIsProxyはtrueを返す
   * SymRawは元の配列を返す
   * @param {Array} target Array
   * @param {string} prop プロパティ
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  get(target, prop, receiver) {
    if (prop === SYM_GET_IS_PROXY) return true;
    if (prop === SYM_GET_RAW) return target;
    return Reflect.get(target, prop, receiver);
  }

  /**
   * setter
   * lengthプロパティの場合、変更通知を送信する
   * @param {Object} target Array
   * @param {string} prop プロパティ
   * @param {Any} value 
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    if (prop === "length") {
      this.#component.updateSlot.addNotify(new NotifyData(this.#component, this.#prop.name, this.#indexes));
    }
    return true;
  }
}

/**
 * 
 * @param {Array<any>} array 
 * @param {Component} component 
 * @param {PropertyInfo} prop 
 * @param {integer[]} indexes 
 * @returns 
 */
export default function create(array, component, prop, indexes) {
  return new Proxy(array, new ArrayHandler(component, prop, indexes))
}
