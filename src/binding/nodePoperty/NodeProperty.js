import "../../types.js";
import { Filter } from "../../filter/Filter.js";

export class NodeProperty {
  /** @type {Node} */
  #node;
  get node() {
    return this.#node;
  }

  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {string[]} */
  #nameElements = [];
  get nameElements() {
    return this.#nameElements;
  }

  /** @type {any} */
  get value() {
    return this.node[this.name];
  }
  set value(value) {
    this.node[this.name] = value;
  }

  /** @type {Filter[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {Object<string,FilterFunc>} */
  #filterFuncs;
  get filterFuncs() {
    return this.#filterFuncs;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForInput(this.value, this.filters, this.filterFuncs) : this.value;
  }

  /**
   * 
   * @param {Node} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(node, name, filters, filterFuncs) {
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
  }
}