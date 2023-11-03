import { UpdateSlotStatus } from "./UpdateSLotStatus.js";

export class NodeUpdateData {
  /** @type {Node} */
  node;

  /** @type {string} */
  property;

  /** @type {string} */
  viewModelProperty;

  /** @type {any} */
  value;

  /** @type {()=>void} */
  updateFunc;

  /**
   * 
   * @param {Node} node 
   * @param {string} property 
   * @param {string} viewModelProperty 
   * @param {any} value 
   * @param {()=>void} updateFunc 
   */
  constructor(node, property, viewModelProperty, value, updateFunc) {
    this.node = node;
    this.property = property;
    this.viewModelProperty = viewModelProperty;
    this.value = value;
    this.updateFunc = updateFunc;
  }
}

export class NodeUpdator {
  /** @type {NodeUpdateData[]} */
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
   * 更新する順番を並び替える
   * HTMLTemplateElementが前
   * その次がHTMLSelectElementでないもの
   * 最後がHTMLSelectElement
   * @param {NodeUpdateData[]} updates 
   * @returns {NodeUpdateData[]}
   */
  reorder(updates) {
    updates.sort((update1, update2) => {
      if (update1.node instanceof Comment && update2.node instanceof Comment) return 0;
      if (update2.node instanceof Comment) return 1;
      if (update1.node instanceof Comment) return -1;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value" && update2.node instanceof HTMLSelectElement && update2.property === "value") return 0;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value") return 1;
      if (update2.node instanceof HTMLSelectElement && update2.property === "value") return -1;
      return 0;
    });
    return updates;
  }

  /**
   * @returns {void}
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNodeUpdate);
    try {
      while(this.queue.length > 0) {
        const updates = this.queue.splice(0);
        const orderedUpdates = this.reorder(updates);
        for(const update of orderedUpdates) {
          Reflect.apply(update.updateFunc, update, []);
        }
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNodeUpdate);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
