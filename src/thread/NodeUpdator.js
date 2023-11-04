import { UpdateSlotStatus } from "./UpdateSLotStatus.js";

export class NodeUpdateData {
  /** @type {import("../binding/Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  /** @type {()=>void} */
  #updateFunc;
  get updateFunc() {
    return this.#updateFunc;
  }

  /**
   * 
   * @param {import("../binding/Binding.js").Binding} binding 
   * @param {()=>void} updateFunc 
   */
  constructor(binding, updateFunc) {
    this.#binding = binding;
    this.#updateFunc = updateFunc;
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
   * ※optionを更新する前に、selectを更新すると、値が設定されない
   * 1.HTMLSelectElementかつvalueプロパティ、でないもの
   * 2.HTMLSelectElementかつvalueプロパティ
   * @param {NodeUpdateData[]} updates 
   * @returns {NodeUpdateData[]}
   */
  reorder(updates) {
    updates.sort((update1, update2) => {
      if (update1.binding.isSelectValue && update2.binding.isSelectValue) return 0;
      if (update1.binding.isSelectValue) return 1;
      if (update2.binding.isSelectValue) return -1;
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
