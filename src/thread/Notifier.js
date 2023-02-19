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
      const queue = this.queue.splice(0);
      /**
       * @type {Map<Component,NotifyData[]>}
       */
      const notifiesByComponent = new Map();
      queue.forEach(notify => {
        notifiesByComponent.set(notify.component, 
          notifiesByComponent.get(notify.component)?.concat(notify) ?? [ notify ]
        );
      });
      for(const [component, notifies] of notifiesByComponent.entries()) {
        const setOfKey = new Set(notifies.map(notify => `${notify.name}\t${notify.indexes}`));
        component.notify(setOfKey);
      }
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
