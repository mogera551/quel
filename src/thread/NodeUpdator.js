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
   * 
   * @param {NodeUpdateData[]} queue 
   */
  reorder(queue) {
    queue.sort((update1, update2) => {
      if (update2.node instanceof HTMLTemplateElement) return 1;
      if (update1.node instanceof HTMLSelectElement && update1.property === "value") return 1;
      return -1;
    });
  }
  /**
   * 
   */
  async exec() {
    while(this.queue.length > 0) {
      const queue = this.queue.splice(0);
      this.reorder(queue);
      queue.forEach(update => Reflect.apply(update.updateFunc, update, []));
    }
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.queue.length === 0;
  }
}
