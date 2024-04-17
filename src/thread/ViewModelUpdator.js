import "../types.js";

export class ProcessData {
  /** @type {()=>void} */
  target;

  /** @type {Object} */
  thisArgument;

  /** @type {any[]} */
  argumentsList;

  /**
   * 
   * @param {()=>void} target 
   * @param {Object} thisArgument 
   * @param {any[]} argumentsList 
   */
  constructor(target, thisArgument, argumentsList) {
    this.target = target;
    this.thisArgument = thisArgument;
    this.argumentsList = argumentsList;
  }
}

export class ViewModelUpdator {
  /** @type {ProcessData[]} */
  queue = [];

  /**
   * 
   */
  async exec() {
    while(this.queue.length > 0) {
      const processes = this.queue;
      this.queue = [];
      for(const process of processes) {
        await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
      }
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}