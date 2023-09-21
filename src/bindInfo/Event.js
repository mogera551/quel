import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Symbols } from "../Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";

export class Event extends BindInfo {
  /** @type {string} */
  #eventType;
  /** @type {string} */
  get eventType() {
    return this.#eventType;
  }
  set eventType(value) {
    this.#eventType = value;
  }

  /**
   * イベントハンドラを設定
   */
  addEventListener() {
    const {component, element, eventType, viewModel, viewModelProperty} = this;
    element.addEventListener(eventType, (event) => {
      event.stopPropagation();
      const context = this.context;
      const process = new ProcessData(
        viewModel[Symbols.directlyCall], viewModel, [viewModelProperty, context, event]
      );
      component.updateSlot.addProcess(process);
    });
  }
}