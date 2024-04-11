import "../types.js";
import { ViewModelHandlerBase } from "../viewModel/ViewModelHandlerBase.js";

function key() {
  return this.propName.name + "\t" + this.indexes.toString();
}

export class NodeUpdator {
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
      const propertyAccessByViewModelPropertyKey = 
        new Map(notifies.concat(dependentPropertyAccesses).map(propertyAccess => [key.apply(propertyAccess), propertyAccess]));
      this.#component.updateNode(propertyAccessByViewModelPropertyKey);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
