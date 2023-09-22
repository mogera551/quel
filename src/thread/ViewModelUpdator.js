import "../types.js";
import { UpdateSlotStatus } from "./UpdateSLotStatus.js";

export class ProcessData {
  /** @type {()=>void} */
  target;

  /** @type {Object} */
  thisArgument;

  /** @type {any[]} */
  argumentsList;

  /**
   * 
   * @param {()=>void} target 
   * @param {Object} thisArgument 
   * @param {any[]} argumentsList 
   */
  constructor(target, thisArgument, argumentsList) {
    this.target = target;
    this.thisArgument = thisArgument;
    this.argumentsList = argumentsList;
  }
}

export class ViewModelUpdator {
  /** @type {ProcessData[]} */
  queue = [];

  /** @type {UpdateSlotStatusCallback} */
  #statusCallback;

  /**
   * @param {UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginViewModelUpdate);
    try {
      while(this.queue.length > 0) {
        const processes = this.queue.splice(0);
        for(const process of processes) {
          await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endViewMmodelUpdate);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}