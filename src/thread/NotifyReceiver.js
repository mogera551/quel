import { ViewModelHandler } from "../newViewModel/Proxy.js";
import { UpdateSlotStatus } from "./UpdateSLotStatus.js";

export class NotifyReceiver {
  /**
   * @type {import("../../modules/dot-notation/dot-notation.js").PropertyAccess[]}
   */
  queue = [];

  /**
   * @type {import("./UpdateSlot.js").UpdateSlotStatusCallback}
   */
  #statusCallback;

  /**
   * @type {import("../component/Component.js").Component}
   */
  #component;

  /**
   * @param {import("../component/Component.js").Component} component
   * @param {import("./UpdateSlot.js").UpdateSlotStatusCallback} statusCallback
   */
  constructor(component, statusCallback) {
    this.#component = component;
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNotifyReceive);
    try {
      while(this.queue.length > 0) {
        const notifies = this.queue.splice(0);
        const dependentPropertyAccesses = [];
        for(const propertyAccess of notifies) {
          dependentPropertyAccesses.push(...ViewModelHandler.makeNotifyForDependentProps(this.#component.viewModel, propertyAccess));
        }
        const setOfUpdatedViewModelPropertyKeys = new Set(
          notifies.concat(dependentPropertyAccesses).map(propertyAccess => propertyAccess.propName.name + "\t" + propertyAccess.indexes.toString())
        );
        this.#component.applyToNode(setOfUpdatedViewModelPropertyKeys);
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNotifyReceive);
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
