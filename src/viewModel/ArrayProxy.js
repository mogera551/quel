import "../types.js";
import { Symbols } from "../Symbols.js";

/**
 * 配列プロキシ
 * 更新（追加・削除）があった場合、更新コールバックを呼び出す
 */
export class Handler {
  #updateCallback;
  get updateCallback() {
    return this.#updateCallback;
  }
  /**
   * コンストラクタ
   * @param {()=>{}} updateCallback
   */
  constructor(updateCallback) {
    this.#updateCallback = updateCallback;
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
    if (prop === Symbols.isProxy) return true;
    if (prop === Symbols.getRaw) return target;
    return Reflect.get(target, prop, receiver);
  }

  /**
   * setter
   * 更新があった場合、lengthがsetされる
   * @param {Object} target Array
   * @param {string} prop プロパティ
   * @param {Any} value 
   * @param {Proxy} receiver 配列プロキシ
   * @returns 
   */
  set(target, prop, value, receiver) {
    Reflect.set(target, prop, value, receiver);
    if (prop === "length") {
      this.updateCallback();
    }
    return true;
  }
}

/**
 * 
 * @param {any[]} array
 * @param {()=>{}} updateCallback
 * @returns 
 */
export function create(array, updateCallback) {
  return new Proxy(array, new Handler(updateCallback))
}
