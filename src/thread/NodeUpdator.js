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
  /** @type {Set<import("../binding/Binding.js").Binding>} */
  queue = new Set;

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
   * @param {import("../binding/Binding.js").Binding[]} bindings 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  reorder(bindings) {
    bindings.sort((binding1, binding2) => {
      if (binding1.isSelectValue && binding2.isSelectValue) return 0;
      if (binding1.isSelectValue) return 1;
      if (binding2.isSelectValue) return -1;
      return 0;
    });
    return bindings;
  }

  /**
   * @returns {void}
   */
  async exec() {
    this.#statusCallback && this.#statusCallback(UpdateSlotStatus.beginNodeUpdate);
    try {
      while(this.queue.size > 0) {
        const bindings = this.reorder(Array.from(this.queue));
        for(const binding of bindings) {
          binding.nodeProperty.assignFromViewModelValue();
        }
        this.queue = new Set;
      }
    } finally {
      this.#statusCallback && this.#statusCallback(UpdateSlotStatus.endNodeUpdate);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.size === 0;
  }
}
