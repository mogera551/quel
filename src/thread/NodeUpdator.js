import { UpdateSlotStatus } from "./Thread.js";

export class NodeUpdateData {
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {string}
   */
  property;
  /**
   * @type {()=>{}}
   */
  updateFunc;

  /**
   * 
   * @param {Node} node 
   * @param {string} property 
   * @param {()=>{}} updateFunc 
   */
  constructor(node, property, updateFunc) {
    this.node = node;
    this.property = property;
    this.updateFunc = updateFunc;
  }
}

export default class {
  /**
   * @type {NodeUpdateData[]}
   */
  queue = [];

  /**
   * @type {import("./Thread.js").UpdateSlotStatusCallback}
   */
  #statusCallback;
  /**
   * @param {import("./Thread.js").UpdateSlotStatusCallback} statusCallback
   */
  constructor(statusCallback) {
    this.#statusCallback = statusCallback;
  }

  /**
   * 
   * @param {NodeUpdateData[]} updates 
   */
  reorder(updates) {
    updates.sort((update1, update2) => {
      if (update2.node instanceof HTMLTemplateElement) return 1;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value") return 1;
      return -1;
    });
    return updates;
  }
  /**
   * 
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNodeUpdate);
    try {
      while(this.queue.length > 0) {
        const updates = this.reorder(this.queue.splice(0));
        updates.forEach(update => Reflect.apply(update.updateFunc, update, []));
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNodeUpdate);
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
