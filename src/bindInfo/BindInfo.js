import "../types.js";
import utils from "../utils.js";
import Filter from "../filter/Filter.js";

export default class BindInfo {
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {HTMLElement}
   */
  get element() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /**
   * @type {string}
   */
  nodeProperty;
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
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {string}
   */
  viewModelProperty;
  /**
   * @type {Filter[]}
   */
  filters;
  /**
   * @type {string[]}
   */
  #indexes;
  #indexesString;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
    this.#viewModelPropertyKey = `${this.viewModelProperty}\t${this.#indexesString}`;
  }
  get indexesString() {
    return this.#indexesString;
  }
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    return this.#viewModelPropertyKey;
  }
  
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
}