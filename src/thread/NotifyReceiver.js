import "../types.js";
import { ViewModelHandlerBase } from "../viewModel/ViewModelHandlerBase.js";
import { UpdateSlotStatus } from "./UpdateSLotStatus.js";

export class NotifyReceiver {
  /** @type {PropertyAccess[]} */
  queue = [];

  /** @type {UpdateSlotStatusCallback} */
  #statusCallback;

  /** @type {Component} */
  #component;

  /**
   * @param {Component} component
   * @param {UpdateSlotStatusCallback} statusCallback
   */
  constructor(component, statusCallback) {
    this.#component = component;
    this.#statusCallback = statusCallback;
  }

  /**
   * @returns {void}
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNotifyReceive);
    try {
      while(this.queue.length > 0) {
        const notifies = this.queue.splice(0);
        const dependentPropertyAccesses = [];
        for(const propertyAccess of notifies) {
          dependentPropertyAccesses.push(...ViewModelHandlerBase.makeNotifyForDependentProps(this.#component.viewModel, propertyAccess));
        }
        const setOfUpdatedViewModelPropertyKeys = new Set(
          notifies.concat(dependentPropertyAccesses).map(propertyAccess => propertyAccess.propName.name + "\t" + propertyAccess.indexes.toString())
        );
        this.#component.updateNode(setOfUpdatedViewModelPropertyKeys);
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNotifyReceive);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
