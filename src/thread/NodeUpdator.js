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
  viewModelProperty;
  value;
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
  constructor(node, property, viewModelProperty, value, updateFunc) {
    this.node = node;
    this.property = property;
    this.viewModelProperty = viewModelProperty;
    this.value = value;
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
   * @type {Map<Node,Map<string,NodeUpdateData>>}
   */
  nodeUpdateDataByPropertyByNode = new Map();
  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  add(nodeUpdateData) {
    let nodeUpdateDataByProperty = this.nodeUpdateDataByPropertyByNode.get(nodeUpdateData.node);
    if (nodeUpdateDataByProperty == null) {
      nodeUpdateDataByProperty = new Map;
      this.nodeUpdateDataByPropertyByNode.set(nodeUpdateData.node, nodeUpdateDataByProperty);
    }
    nodeUpdateDataByProperty.set(nodeUpdateData.property, nodeUpdateData);
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
      while(this.nodeUpdateDataByPropertyByNode.size > 0) {
        const updates = Array.from(this.nodeUpdateDataByPropertyByNode.entries()).flatMap(([ node, nodeUpdateDataByProperty ]) => {
          return Array.from(nodeUpdateDataByProperty.entries()).map(([property, nodeUpdateData]) => nodeUpdateData)
        });
        this.nodeUpdateDataByPropertyByNode.clear();
        const orderedUpdates = this.reorder(updates.splice(0));
        orderedUpdates.forEach(update => Reflect.apply(update.updateFunc, update, []));
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
