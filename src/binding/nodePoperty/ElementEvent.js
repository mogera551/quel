import { utils } from "../../utils.js";
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
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!name.startsWith("on")) utils.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
    this.element.addEventListener(this.eventType, this.binding.eventHandler);
  }

}