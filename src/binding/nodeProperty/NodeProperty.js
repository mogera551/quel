import "../../types.js";
import { utils } from "../../utils.js";
import { FilterManager } from "../../filter/Manager.js";

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

  /** @type {FilterFunc[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? FilterManager.applyFilter(this.value, this.filters) : this.value;
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

  /** @type {boolean} */
  get loopable() {
    return false;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Node} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    const input = binding.component.filters.in;
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = filters.toReversed().map(info => input.getFilterFunc(info.name)(info.options));
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  /**
   * 更新後処理
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  postUpdate(propertyAccessByViewModelPropertyKey) {
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return this.value === value;
  }

  /**
   * @param {Set<number>} setOfIndex
   */
  applyToChildNodes(setOfIndex) {
  }

  clearValue() {
  }
}