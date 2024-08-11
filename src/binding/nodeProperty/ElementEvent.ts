import { Symbols } from "../../Symbols.js";
import { FilterManager, Filters } from "../../filter/Manager";
import { EventFilterFunc, FilterType, IFilterInfo } from "../../@types/filter.js";
import { utils } from "../../utils";
import { IBinding } from "../../@types/binding";
import { ElementBase } from "./ElementBase";

const PREFIX = "on";

export class ElementEvent extends ElementBase {
  // nameのonの後ろを取得する
  get eventType():string {
    return this.name.slice(PREFIX.length); // on～
  }

  // applyToNode()の対象かどうか
  get applicable():boolean {
    return false;
  }

  // イベントハンドラ
  #handler:((event:Event)=>void)|undefined;
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
    this.#eventFilters = Filters.create<FilterType.Event>(filters, binding.component.eventFilterManager);
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
    if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false)) return;
    const { stateProperty = undefined, loopContext = undefined } = this.binding ?? {};
    return stateProperty?.state[Symbols.directlyCall](stateProperty.name, loopContext, event);
  }

  eventHandler(event:Event) {
    // 再構築などでバインドが削除されている場合は処理しない
    if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false)) return;
    // event filter
    event = this.eventFilters.length > 0 ? FilterManager.applyFilter<FilterType.Event>(event, this.eventFilters) : event;
    !(Reflect.has(event, "noStopPropagation") ?? false) && event.stopPropagation();
    this.binding.component.updator.addProcess(this.directlyCall, this, [event]);
  }
}