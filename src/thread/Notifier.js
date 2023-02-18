import Component from "../component/Component.js";

export class NotifyData {
  /**
   * @type {Component}
   */
  component;
  /**
   * @type {string}
   */
  name;
  /**
   * @type {integer[]}
   */
  #indexes;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }

  /**
   * 
   * @param {Component} component
   * @param {string} name 
   * @param {integer[]} indexes 
   */
  constructor(component, name, indexes) {
    this.component = component;
    this.name = name;
    this.indexes = indexes;
  }
}

export default class {
  /**
   * @type {NotifyData[]}
   */
  queue = [];

  /**
   * 
   */
  async exec() {
    while(this.queue.length > 0) {
      const notify = this.queue.shift();
      // notify
      notify.component.notify(notify.name, notify.indexes);
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
