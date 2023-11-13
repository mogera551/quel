import "../types.js";
import { ViewModelHandlerBase } from "../viewModel/ViewModelHandlerBase.js";

export class NotifyReceiver {
  /** @type {PropertyAccess[]} */
  queue = [];

  /** @type {Component} */
  #component;

  /**
   * @param {Component} component
   */
  constructor(component) {
    this.#component = component;
  }

  /**
   * @returns {void}
   */
  async exec() {
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
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
