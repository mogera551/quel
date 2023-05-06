import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Symbols } from "../viewModel/Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";

export class Event extends BindInfo {
  #eventType;
  /**
   * @type {string}
   */
  get eventType() {
    return this.#eventType;
  }
  set eventType(value) {
    this.#eventType = value;
  }
  /**
   * 
   */
  addEventListener() {
    const {component, element, eventType, viewModel, viewModelProperty} = this;
    element.addEventListener(eventType, (event) => {
      event.stopPropagation();
      const contextIndexes = this.contextIndexes;
      const process = new ProcessData(
        viewModel[Symbols.directlyCall], viewModel, [viewModelProperty, contextIndexes, event]
      );
      component.updateSlot.addProcess(process);
    });
  }
}