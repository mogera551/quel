import BindInfo from "./BindInfo.js";
import { SYM_CALL_DIRECT_CALL } from "../viewModel/Symbols.js";
import { ProcessData } from "../thread/Processor.js";

export default class Event extends BindInfo {
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
        viewModel[SYM_CALL_DIRECT_CALL], viewModel, [viewModelProperty, contextIndexes, event]
      );
      component.updateSlot.addProcess(process);
    });
  }
}