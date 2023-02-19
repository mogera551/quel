import BindInfo from "./BindInfo.js";
import { SYM_CALL_DIRECT_CALL } from "../viewModel/Symbols.js";
import { ProcessData } from "../thread/Processor.js";
import Thread from "../thread/Thread.js";

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
    const {element, eventType, viewModel, viewModelProperty, indexes, filters} = this;
    element.addEventListener(eventType, (event) => {
      const process = new ProcessData(
        viewModel[SYM_CALL_DIRECT_CALL], viewModel, [viewModelProperty, indexes, event]
      );
      Thread.current.addProcess(process);
      //viewModel[SYM_CALL_DIRECT_CALL](viewModelProperty, indexes, event);

    });
  }
}