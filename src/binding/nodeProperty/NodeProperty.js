import "../../types.js";
import { Filter } from "../../filter/Filter.js";
import { utils } from "../../utils.js";

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
    console.log(`node.${this.name} = ${value}`);
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

  /** @type {boolean} applyToNode()の対象かどうか */
  get applicable() {
    return true;
  }

  /** @type {import("../Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  /** @type {boolean} */
  get expandable() {
    return false;
  }

  /** @type {boolean} */
  get isSelectValue() {
    return false;
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return this.value === value;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Node} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node instanceof Node)) utils.raise("not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  /**
   * 更新前処理
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  beforeUpdate(setOfUpdatedViewModelPropertyKeys) {
  }
}