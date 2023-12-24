import { Symbols } from "../../Symbols.js";
import { ProcessData } from "../../thread/ViewModelUpdator.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

export class ElementEvent extends ElementBase {
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
    if (!name.startsWith("on")) utils.raise(`ElementEvent: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    const handler = event => this.eventHandler(event);
    this.element.addEventListener(this.eventType, handler);
  }

  /**
   * 
   * @param {Event} event
   */
  async directlyCall(event) {
    const { viewModelProperty, loopContext } = this.binding;
    return viewModelProperty.viewModel[Symbols.directlyCall](viewModelProperty.name, loopContext, event);
  }
  /**
   * 
   * @param {Event} event
   */
  createProcessData(event) {
    return new ProcessData(this.directlyCall, this, [event]);
  }

  /**
   * 
   * @param {Event} event
   */
  eventHandler(event) {
    if (!this.binding.component.bindingSummary.allBindings.has(this.binding)) {
      //console.log(`binding(${this.binding.id}) is already deleted`);
      return;
    }
    event.stopPropagation();
    const processData = this.createProcessData(event);
    this.binding.component.updateSlot.addProcess(processData);
  }
}