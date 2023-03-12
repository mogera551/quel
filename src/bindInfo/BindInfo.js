import "../types.js";
import utils from "../utils.js";
import Filter from "../filter/Filter.js";
import Component from "../component/Component.js";

export default class BindInfo {
  /**
   * @type {Node}
   */
  #node;
  get node() {
    return this.#node;
  }
  set node(node) {
    this.#node = node;
  }
  /**
   * @type {HTMLElement}
   */
  get element() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /**
   * @type {string}
   */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(value) {
    this.#nodeProperty = value;
  }

  /**
   * @type {string[]}
   */
  #nodePropertyElements;
  get nodePropertyElements() {
    return this.#nodePropertyElements;
  }
  set nodePropertyElements(value) {
    this.#nodePropertyElements = value;
  }

  /**
   * @type {Component}
   */
  component;
  /**
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {string}
   */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }
  set viewModelProperty(value) {
    this.#viewModelProperty = value;
  }
  /**
   * @type {Filter[]}
   */
  filters;

  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
    this.#viewModelPropertyKey = this.viewModelProperty + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    return this.#viewModelPropertyKey;
  }
  /**
   * @type {number[]}
   */
  contextIndexes;
  
  /**
   * @type {any}
   */
  lastNodeValue;
  /**
   * @type
   */
  lastViewModelValue;

  /**
   * Nodeのプロパティを更新する
   */
  updateNode() {}

  /**
   * ViewModelのプロパティを更新する
   */
  updateViewModel() {}

  /**
   * 
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndexes(index, diff) {
    const { indexes, contextIndexes } = this;
    indexes[index] = indexes[index] + diff;
    contextIndexes[index] = contextIndexes[index] + diff;
    this.indexes = indexes;
 }

  /**
   * 
   */
  removeFromParent() { }
}