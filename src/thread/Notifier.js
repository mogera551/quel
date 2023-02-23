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
    this.#key = this.name + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #key;
  get key() {
    return this.#key;
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

const getNnotifyKey = notify => notify.key;

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
      const notifies = this.queue.splice(0);
      /**
       * @type {Map<Component,NotifyData[]>}
       */
      const notifiesByComponent = notifies.reduce((map, notify) => {
        map.get(notify.component)?.push(notify) ?? map.set(notify.component, [ notify ]);
        return map;
      }, new Map);
      
      for(const [component, notifies] of notifiesByComponent.entries()) {
        const setOfKey = new Set(notifies.map(getNnotifyKey));
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
