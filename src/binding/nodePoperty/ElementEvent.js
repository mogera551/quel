import { ElementProperty } from "./ElementProperty.js";

export class ElementEvent extends ElementProperty {
  /** @type {string} nameのonの後ろを取得する */
  get eventType() {
    return this.name.slice(2); // on～
  }

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return false;
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
    this.element.addEventListener(this.eventType, binding.getExecEventHandler());
  }

}