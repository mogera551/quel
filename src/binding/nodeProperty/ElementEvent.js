import { Symbols } from "../../Symbols.js";
import { FilterManager } from "../../filter/Manager.js";
import { ProcessData } from "../../thread/ViewModelUpdator.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

const PREFIX = "on";

export class ElementEvent extends ElementBase {
  /** @type {string} nameのonの後ろを取得する */
  get eventType() {
    return this.name.slice(PREFIX.length); // on～
  }

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return false;
  }

  /**
   * @type {(event:Event)=>{}} イベントハンドラ
   */
  #handler;
  get handler() {
    if (typeof this.#handler === "undefined") {
      this.#handler = event => this.eventHandler(event);
    }
    return this.#handler;
  }

  /** @type {EventFilterFunc[]} */
  #eventFilters = [];
  get eventFilters() {
    return this.#eventFilters;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!name.startsWith(PREFIX)) utils.raise(`ElementEvent: invalid property name ${name}`);
    super(binding, node, name, filters);
    const event = binding.component.filters.event;
    this.#eventFilters = filters.map(info => event.getFilterFunc(info.name)(info.options));
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.element.addEventListener(this.eventType, this.handler);
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
    // 再構築などでバインドが削除されている場合は処理しない
    if (!this.binding.component.bindingSummary.allBindings.has(this.binding)) return;
    // event filter
    event = this.eventFilters.length > 0 ? FilterManager.applyFilter(event, this.eventFilters) : event;
    !(event?.noStopPropagation ?? false) && event.stopPropagation();
    const processData = this.createProcessData(event);
    this.binding.component.updateSlot.addProcess(processData);
  }
}