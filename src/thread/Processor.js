export class ProcessData {
  /**
   * @type {()=>{}}
   */
  target;
  /**
   * @type {Object}
   */
  thisArgument;
  /**
   * @type {any[]}
   */
  argumentsList;

  /**
   * 
   * @param {()=>{}} target 
   * @param {Object} thisArgument 
   * @param {any[]} argumentsList 
   */
  constructor(target, thisArgument, argumentsList) {
    this.target = target;
    this.thisArgument = thisArgument;
    this.argumentsList = argumentsList;
  }
}

export default class {
  /**
   * @type {ProcessData[]}
   */
  queue = [];

  /**
   * 
   */
  async exec() {
    while(this.queue.length > 0) {
      const processes = this.queue.splice(0);
      for(const process of processes) {
        await Reflect.apply(process.target, process.thisArgument, process.argumentsList);
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