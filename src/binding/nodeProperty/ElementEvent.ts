import { utils } from "../../utils";
import { EventFilterFunc, IFilterInfo } from "../../@types/filter.js";
import { DirectryCallApiSymbol } from "../../@symbols/state.js";
import { FilterManager, Filters } from "../../filter/Manager";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../../@types/binding";

const PREFIX = "on";

export class ElementEvent extends ElementBase {
  // nameのonの後ろを取得する
  get eventType(): string {
    return this.name.slice(PREFIX.length); // on～
  }

  // applyToNode()の対象かどうか
  get applicable(): boolean {
    return false;
  }

  // イベントハンドラ
  #handler?: (event:Event)=>void;
  get handler():(event:Event)=>void {
    if (typeof this.#handler === "undefined") {
      this.#handler = event => this.eventHandler(event);
    }
    return this.#handler;
  }

  #eventFilters:EventFilterFunc[] = [];
  get eventFilters() {
    return this.#eventFilters;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!name.startsWith(PREFIX)) utils.raise(`ElementEvent: invalid property name ${name}`);
    super(binding, node, name, filters);
    this.#eventFilters = Filters.create<"event">(filters, binding.eventFilterManager);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.element.addEventListener(this.eventType, this.handler);
  }

  async directlyCall(event:Event) {
    // 再構築などでバインドが削除されている場合は処理しない
    if (!(this.binding.bindingSummary?.exists(this.binding)) ?? false) return;
    return this.binding.stateProperty.state[DirectryCallApiSymbol](
      this.binding.stateProperty.name, 
      this.binding.parentContentBindings.currentLoopContext, 
      event);
  }

  eventHandler(event:Event) {
    // 再構築などでバインドが削除されている場合は処理しない
    if (!(this.binding.bindingSummary?.exists(this.binding) ?? false)) return;
    // event filter
    event = this.eventFilters.length > 0 ? FilterManager.applyFilter<"event">(event, this.eventFilters) : event;
    if ((Reflect.get(event, "noStopPropagation") ?? false) === false) {
      event.stopPropagation();
    }
    this.binding.updator?.addProcess(this.directlyCall, this, [event]);
  }
}