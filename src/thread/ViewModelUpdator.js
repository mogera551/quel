import { Symbols } from "../Symbols.js";
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
  /** @type {PropertyAccess[]} */
  updatedProps = [];

  /** @type {Component} */
  #component;

  /**
   * @param {Component} component
   */
  constructor(component) {
    this.#component = component;
  }

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
    while(this.updatedProps.length > 0) {
      const updatedProps = this.updatedProps;
      this.updatedProps = [];
      const params = updatedProps.map(prop => [prop.propName.name, prop.indexes]);
      this.#component.writableViewModel[Symbols.updatedCallback](params);
    }
  }

  /** @type {boolean} */
  get isEmpty() {
    return this.queue.length === 0;
  }
}