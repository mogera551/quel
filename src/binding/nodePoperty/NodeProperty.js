import "../../types.js";
import { Filter } from "../../filter/Filter.js";

export class NodeProperty {
  /** @type {Node} */
  #node;
  get node() {
    return this.#node;
  }
  set node(value) {
    this.#node = value;
  }

  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
    this.#nameElements = value.split(".");
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
  filters;

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForInput(this.value, this.filters) : this.value;
  }

  /**
   * 
   * @param {Node} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   */
  constructor(node, name, filters) {
    this.node = node;
    this.name = name;
    this.filters = filters;
  }

  /**
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
  }
}